import { Router } from "express";
import { z } from "zod";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";

export const gisRoutes = Router();

const gisFilters = z.object({
  query: z.object({
    estado: z.enum(["pendiente", "validado", "rechazado", "atendido", "archivado"]).optional(),
    categoria_id: z.coerce.number().int().positive().optional(),
    zona_id: z.coerce.number().int().positive().optional(),
    fecha_inicio: z.iso.date().optional(),
    fecha_fin: z.iso.date().optional()
  })
});

const analysisUnitFilters = z.object({
  query: z.object({
    tamanio: z.coerce.number().int().refine((value) => [250, 500].includes(value)).default(500),
    estado: z.enum(["pendiente", "validado", "rechazado", "atendido", "archivado"]).optional(),
    categoria_id: z.coerce.number().int().positive().optional(),
    zona_id: z.coerce.number().int().positive().optional(),
    fecha_inicio: z.iso.date().optional(),
    fecha_fin: z.iso.date().optional()
  })
});

function filterValues(req) {
  return [
    req.query.estado ?? null,
    req.query.categoria_id ?? null,
    req.query.zona_id ?? null,
    req.query.fecha_inicio ?? null,
    req.query.fecha_fin ?? null
  ];
}

gisRoutes.use(authenticateAdmin, requireRole("gestor", "administrador"));

gisRoutes.get("/gis/reportes.geojson", validate(gisFilters), asyncHandler(async (req, res) => {
  const result = await query(`
    select jsonb_build_object(
      'type', 'FeatureCollection',
      'features', coalesce(jsonb_agg(jsonb_build_object(
        'type', 'Feature',
        'geometry', st_asgeojson(r.ubicacion)::jsonb,
        'properties', jsonb_build_object(
          'id', r.id,
          'categoria_id', r.categoria_id,
          'categoria', c.nombre,
          'zona_id', r.zona_id,
          'zona', z.nombre,
          'urgencia', r.urgencia,
          'estado', r.estado,
          'created_at', r.created_at
        )
      )), '[]'::jsonb)
    ) as geojson
    from reportes r
    left join categorias c on c.id = r.categoria_id
    left join zonas z on z.id = r.zona_id
    where ($1::varchar is null or r.estado = $1::varchar)
      and ($2::int is null or r.categoria_id = $2::int)
      and ($3::int is null or r.zona_id = $3::int)
      and ($4::date is null or r.created_at::date >= $4::date)
      and ($5::date is null or r.created_at::date <= $5::date)
  `, filterValues(req));

  res.json(result.rows[0].geojson);
}));

gisRoutes.get("/gis/zonas.geojson", asyncHandler(async (_req, res) => {
  const result = await query(`
    select jsonb_build_object(
      'type', 'FeatureCollection',
      'features', coalesce(jsonb_agg(jsonb_build_object(
        'type', 'Feature',
        'geometry', st_asgeojson(z.geom)::jsonb,
        'properties', jsonb_build_object('id', z.id, 'nombre', z.nombre, 'activo', z.activo)
      )), '[]'::jsonb)
    ) as geojson
    from zonas z
    where z.activo = true and z.geom is not null
  `);

  res.json(result.rows[0].geojson);
}));

gisRoutes.get("/gis/heatmap", validate(gisFilters), asyncHandler(async (req, res) => {
  const result = await query(`
    with celdas as (
      select st_snaptogrid(ubicacion, 0.001) as centro, count(*)::int as intensidad
      from reportes r
      where ($1::varchar is null or r.estado = $1::varchar)
        and ($2::int is null or r.categoria_id = $2::int)
        and ($3::int is null or r.zona_id = $3::int)
        and ($4::date is null or r.created_at::date >= $4::date)
        and ($5::date is null or r.created_at::date <= $5::date)
      group by st_snaptogrid(ubicacion, 0.001)
    )
    select
      round(st_y(centro)::numeric, 6)::float as latitud,
      round(st_x(centro)::numeric, 6)::float as longitud,
      intensidad
    from celdas
    order by intensidad desc
    limit 1000
  `, filterValues(req));

  res.json({ data: result.rows });
}));

gisRoutes.get("/gis/concentracion-zonas.geojson", validate(gisFilters), asyncHandler(async (req, res) => {
  const result = await query(`
    with conteos as (
      select z.id, z.nombre, z.geom, count(r.id)::int as total
      from zonas z
      left join reportes r
        on r.zona_id = z.id
       and ($1::varchar is null or r.estado = $1::varchar)
       and ($2::int is null or r.categoria_id = $2::int)
       and ($3::int is null or r.zona_id = $3::int)
       and ($4::date is null or r.created_at::date >= $4::date)
       and ($5::date is null or r.created_at::date <= $5::date)
      where z.activo and z.geom is not null
      group by z.id, z.nombre, z.geom
    ),
    estadisticas as (
      select avg(total::numeric) as media, stddev_pop(total::numeric) as desviacion
      from conteos
    ),
    clasificacion as (
      select
        c.*,
        case when e.desviacion = 0 then 0 else (c.total - e.media) / e.desviacion end as z_score,
        e.media,
        e.desviacion
      from conteos c
      cross join estadisticas e
    )
    select jsonb_build_object(
      'type', 'FeatureCollection',
      'method', 'conteo estandarizado por zona',
      'threshold', 0.75,
      'warning', 'Clasificacion exploratoria; no implica causalidad ni corresponde a Getis-Ord Gi*.',
      'features', coalesce(jsonb_agg(jsonb_build_object(
        'type', 'Feature',
        'geometry', st_asgeojson(geom)::jsonb,
        'properties', jsonb_build_object(
          'id', id,
          'nombre', nombre,
          'total', total,
          'z_score', round(z_score, 3),
          'clasificacion', case
            when z_score >= 0.75 then 'hotspot'
            when z_score <= -0.75 then 'coldspot'
            else 'neutral'
          end
        )
      ) order by id), '[]'::jsonb)
    ) as geojson
    from clasificacion
  `, filterValues(req));

  res.json(result.rows[0].geojson);
}));

gisRoutes.get("/gis/unidades-analisis.geojson", validate(analysisUnitFilters), asyncHandler(async (req, res) => {
  const filters = req.validatedQuery;
  const values = [
    filters.tamanio,
    filters.estado ?? null,
    filters.categoria_id ?? null,
    filters.zona_id ?? null,
    filters.fecha_inicio ?? null,
    filters.fecha_fin ?? null
  ];
  const result = await query(`
    with unidades as (
      select
        u.id,
        u.codigo,
        u.tamanio_m,
        u.geom,
        u.area_m2,
        count(r.id)::int as total,
        (select count(*)::int from unidad_vecinos v where v.unidad_id = u.id) as vecinos
      from unidades_espaciales u
      left join reportes r
        on st_covers(u.geom, r.ubicacion)
       and ($2::varchar is null or r.estado = $2::varchar)
       and ($3::int is null or r.categoria_id = $3::int)
       and ($4::int is null or r.zona_id = $4::int)
       and ($5::date is null or r.created_at::date >= $5::date)
       and ($6::date is null or r.created_at::date <= $6::date)
      where u.tamanio_m = $1::int
      group by u.id, u.codigo, u.tamanio_m, u.geom, u.area_m2
    )
    select jsonb_build_object(
      'type', 'FeatureCollection',
      'tamanio_m', $1::int,
      'total_unidades', count(*)::int,
      'unidades_aisladas', count(*) filter (where vecinos = 0)::int,
      'features', coalesce(jsonb_agg(jsonb_build_object(
        'type', 'Feature',
        'geometry', st_asgeojson(geom)::jsonb,
        'properties', jsonb_build_object(
          'id', id,
          'codigo', codigo,
          'tamanio_m', tamanio_m,
          'area_m2', area_m2,
          'total', total,
          'densidad_km2', round((total / nullif(area_m2, 0) * 1000000)::numeric, 3),
          'vecinos', vecinos
        )
      ) order by codigo), '[]'::jsonb)
    ) as geojson
    from unidades
  `, values);

  res.json(result.rows[0].geojson);
}));

gisRoutes.post("/gis/analisis/kde", asyncHandler(async (req, res) => {
  const result = await query(`
    insert into analisis_kde (periodo_inicio, periodo_fin, categoria_id, zona_id, total_reportes, resultado_json, geom_hull)
    select
      $1::date,
      $2::date,
      $3::int,
      $4::int,
      count(*)::int,
      jsonb_build_object('tipo', 'heatmap-basico', 'nota', 'Analisis exploratorio agregado para MVP'),
      case when count(*) >= 3 then st_convexhull(st_collect(ubicacion))::geometry(Polygon, 4326) else null end
    from reportes
    where estado = 'validado'
      and ($1::date is null or created_at::date >= $1::date)
      and ($2::date is null or created_at::date <= $2::date)
      and ($3::int is null or categoria_id = $3::int)
      and ($4::int is null or zona_id = $4::int)
    returning *
  `, [
    req.body?.periodo_inicio ?? null,
    req.body?.periodo_fin ?? null,
    req.body?.categoria_id ?? null,
    req.body?.zona_id ?? null
  ]);

  res.status(201).json({ data: result.rows[0] });
}));
