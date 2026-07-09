import { Router } from "express";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middlewares/validate.js";
import { comparisonFilters } from "./indicatorRoutes.js";
import { comparePeriods } from "../services/indicatorComparisonService.js";

export const exportRoutes = Router();

exportRoutes.get("/export/reportes.csv", authenticateAdmin, requireRole("gestor", "administrador"), asyncHandler(async (_req, res) => {
  const result = await query(`
    select id, categoria_nombre, urgencia, estado, zona_nombre, direccion_aprox, latitud, longitud, created_at
    from vw_reportes_dashboard
    order by created_at desc
  `);

  const headers = ["id", "categoria", "urgencia", "estado", "zona", "direccion_aprox", "latitud", "longitud", "created_at"];
  const lines = [headers.join(",")];

  for (const row of result.rows) {
    lines.push([
      row.id,
      row.categoria_nombre,
      row.urgencia,
      row.estado,
      row.zona_nombre,
      row.direccion_aprox,
      row.latitud,
      row.longitud,
      row.created_at?.toISOString?.() ?? row.created_at
    ].map((value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`).join(","));
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=reportes.csv");
  res.send(lines.join("\n"));
}));

exportRoutes.get(
  "/export/comparacion-periodos.csv",
  authenticateAdmin,
  requireRole("gestor", "administrador"),
  validate(comparisonFilters),
  asyncHandler(async (req, res) => {
    const comparison = await comparePeriods(req.query);
    const lines = ["agrupacion,nombre,periodo_a,periodo_b,diferencia,variacion_porcentual"];

    for (const row of comparison.data) {
      lines.push([
        comparison.agrupacion,
        row.nombre,
        row.periodo_a,
        row.periodo_b,
        row.diferencia,
        row.variacion_porcentual ?? ""
      ].map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(","));
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=comparacion-periodos.csv");
    res.send(lines.join("\n"));
  })
);
