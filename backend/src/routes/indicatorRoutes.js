import { Router } from "express";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const indicatorRoutes = Router();

indicatorRoutes.use(authenticateAdmin, requireRole("gestor", "administrador"));

indicatorRoutes.get("/indicadores/resumen", asyncHandler(async (_req, res) => {
  const result = await query(`
    select
      count(*)::int as total_reportes,
      count(*) filter (where estado = 'pendiente')::int as pendientes,
      count(*) filter (where estado = 'validado')::int as validados,
      count(*) filter (where estado = 'rechazado')::int as rechazados,
      count(*) filter (where estado = 'atendido')::int as atendidos,
      count(*) filter (where estado = 'archivado')::int as archivados
    from reportes
  `);
  res.json({ data: result.rows[0] });
}));

indicatorRoutes.get("/indicadores/por-categoria", asyncHandler(async (_req, res) => {
  const result = await query(`
    select c.id, c.nombre, count(r.id)::int as total
    from categorias c
    left join reportes r on r.categoria_id = c.id
    group by c.id, c.nombre
    order by total desc, c.nombre asc
  `);
  res.json({ data: result.rows });
}));

indicatorRoutes.get("/indicadores/por-zona", asyncHandler(async (_req, res) => {
  const result = await query(`
    select z.id, z.nombre, count(r.id)::int as total
    from zonas z
    left join reportes r on r.zona_id = z.id
    group by z.id, z.nombre
    order by total desc, z.nombre asc
  `);
  res.json({ data: result.rows });
}));

indicatorRoutes.get("/indicadores/por-periodo", asyncHandler(async (req, res) => {
  const period = req.query.periodo === "mes" ? "month" : "day";
  const result = await query(`
    select date_trunc($1, created_at)::date as periodo, count(*)::int as total
    from reportes
    group by periodo
    order by periodo asc
  `, [period]);
  res.json({ data: result.rows });
}));
