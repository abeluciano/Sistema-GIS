import { Router } from "express";
import { z } from "zod";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";

export const indicatorRoutes = Router();

const indicatorFilters = z.object({
  query: z.object({
    estado: z.enum(["pendiente", "validado", "rechazado", "atendido", "archivado"]).optional(),
    categoria_id: z.coerce.number().int().positive().optional(),
    zona_id: z.coerce.number().int().positive().optional(),
    urgencia: z.enum(["baja", "media", "alta", "critica"]).optional(),
    fecha_inicio: z.iso.date().optional(),
    fecha_fin: z.iso.date().optional(),
    periodo: z.enum(["dia", "mes"]).optional()
  })
});

function filterValues(req) {
  return [
    req.query.estado ?? null,
    req.query.categoria_id ?? null,
    req.query.zona_id ?? null,
    req.query.urgencia ?? null,
    req.query.fecha_inicio ?? null,
    req.query.fecha_fin ?? null
  ];
}

const filterSql = `
  ($1::varchar is null or r.estado = $1::varchar)
  and ($2::int is null or r.categoria_id = $2::int)
  and ($3::int is null or r.zona_id = $3::int)
  and ($4::varchar is null or r.urgencia = $4::varchar)
  and ($5::date is null or r.created_at::date >= $5::date)
  and ($6::date is null or r.created_at::date <= $6::date)
`;

const periodFilterSql = `
  ($2::varchar is null or r.estado = $2::varchar)
  and ($3::int is null or r.categoria_id = $3::int)
  and ($4::int is null or r.zona_id = $4::int)
  and ($5::varchar is null or r.urgencia = $5::varchar)
  and ($6::date is null or r.created_at::date >= $6::date)
  and ($7::date is null or r.created_at::date <= $7::date)
`;

indicatorRoutes.use(authenticateAdmin, requireRole("gestor", "administrador"));

indicatorRoutes.get("/indicadores/resumen", validate(indicatorFilters), asyncHandler(async (req, res) => {
  const result = await query(`
    select
      count(*)::int as total_reportes,
      count(*) filter (where estado = 'pendiente')::int as pendientes,
      count(*) filter (where estado = 'validado')::int as validados,
      count(*) filter (where estado = 'rechazado')::int as rechazados,
      count(*) filter (where estado = 'atendido')::int as atendidos,
      count(*) filter (where estado = 'archivado')::int as archivados
    from reportes r
    where ${filterSql}
  `, filterValues(req));
  res.json({ data: result.rows[0] });
}));

indicatorRoutes.get("/indicadores/por-categoria", validate(indicatorFilters), asyncHandler(async (req, res) => {
  const result = await query(`
    select c.id, c.nombre, count(*)::int as total
    from reportes r
    join categorias c on c.id = r.categoria_id
    where ${filterSql}
    group by c.id, c.nombre
    order by total desc, c.nombre asc
  `, filterValues(req));
  res.json({ data: result.rows });
}));

indicatorRoutes.get("/indicadores/por-zona", validate(indicatorFilters), asyncHandler(async (req, res) => {
  const result = await query(`
    select z.id, z.nombre, count(*)::int as total
    from reportes r
    join zonas z on z.id = r.zona_id
    where ${filterSql}
    group by z.id, z.nombre
    order by total desc, z.nombre asc
  `, filterValues(req));
  res.json({ data: result.rows });
}));

indicatorRoutes.get("/indicadores/por-periodo", validate(indicatorFilters), asyncHandler(async (req, res) => {
  const period = req.query.periodo === "mes" ? "month" : "day";
  const result = await query(`
    select date_trunc($1, created_at)::date as periodo, count(*)::int as total
    from reportes r
    where ${periodFilterSql}
    group by periodo
    order by periodo asc
  `, [period, ...filterValues(req)]);
  res.json({ data: result.rows });
}));
