import { Router } from "express";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
