import { Router } from "express";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const gisRoutes = Router();

gisRoutes.use(authenticateAdmin, requireRole("gestor", "administrador"));

gisRoutes.get("/gis/reportes.geojson", asyncHandler(async (req, res) => {
  const estado = req.query.estado;
  const values = [];
  const where = estado ? "where r.estado = $1" : "";
  if (estado) values.push(estado);

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
    ${where}
  `, values);

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
    where z.geom is not null
  `);

  res.json(result.rows[0].geojson);
}));

gisRoutes.get("/gis/heatmap", asyncHandler(async (_req, res) => {
  const result = await query(`
    select
      round(st_y(ubicacion)::numeric, 6)::float as latitud,
      round(st_x(ubicacion)::numeric, 6)::float as longitud,
      count(*)::int as intensidad
    from reportes
    where estado = 'validado'
    group by round(st_y(ubicacion)::numeric, 6), round(st_x(ubicacion)::numeric, 6)
    order by intensidad desc
    limit 1000
  `);

  res.json({ data: result.rows });
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
