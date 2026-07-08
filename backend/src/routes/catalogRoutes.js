import { Router } from "express";
import { z } from "zod";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const catalogRoutes = Router();

const idParams = z.object({ params: z.object({ id: z.coerce.number().int().positive() }) });
const categoryBody = z.object({
  body: z.object({
    nombre: z.string().min(2).max(50),
    descripcion: z.string().optional().nullable()
  })
});
const zoneBody = z.object({
  body: z.object({
    nombre: z.string().min(2).max(100),
    descripcion: z.string().optional().nullable(),
    geojson: z.object({ type: z.string(), coordinates: z.array(z.any()) }).optional()
  })
});
const activeBody = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ activo: z.boolean() })
});

catalogRoutes.get("/categorias", asyncHandler(async (_req, res) => {
  const result = await query("select * from categorias order by nombre asc");
  res.json({ data: result.rows });
}));

catalogRoutes.post("/categorias", authenticateAdmin, requireRole("gestor", "administrador"), validate(categoryBody), asyncHandler(async (req, res) => {
  const result = await query(
    "insert into categorias (nombre, descripcion) values ($1, $2) returning *",
    [req.body.nombre, req.body.descripcion ?? null]
  );
  res.status(201).json({ data: result.rows[0] });
}));

catalogRoutes.put("/categorias/:id", authenticateAdmin, requireRole("gestor", "administrador"), validate(idParams.merge(categoryBody)), asyncHandler(async (req, res) => {
  const result = await query(
    "update categorias set nombre = $2, descripcion = $3, updated_at = now() where id = $1 returning *",
    [req.params.id, req.body.nombre, req.body.descripcion ?? null]
  );
  if (!result.rows[0]) throw new HttpError(404, "Categoria no encontrada.");
  res.json({ data: result.rows[0] });
}));

catalogRoutes.patch("/categorias/:id/estado", authenticateAdmin, requireRole("gestor", "administrador"), validate(activeBody), asyncHandler(async (req, res) => {
  const result = await query(
    "update categorias set activo = $2, updated_at = now() where id = $1 returning *",
    [req.params.id, req.body.activo]
  );
  if (!result.rows[0]) throw new HttpError(404, "Categoria no encontrada.");
  res.json({ data: result.rows[0] });
}));

catalogRoutes.get("/zonas", asyncHandler(async (_req, res) => {
  const result = await query(`
    select id, nombre, descripcion, activo, created_at, updated_at, st_asgeojson(geom)::json as geojson
    from zonas
    order by nombre asc
  `);
  res.json({ data: result.rows });
}));

catalogRoutes.post("/zonas", authenticateAdmin, requireRole("gestor", "administrador"), validate(zoneBody), asyncHandler(async (req, res) => {
  const result = await query(
    `
      insert into zonas (nombre, descripcion, geom)
      values ($1, $2, case when $3::jsonb is null then null else st_setsrid(st_geomfromgeojson($3::text), 4326) end)
      returning id, nombre, descripcion, activo, created_at, updated_at, st_asgeojson(geom)::json as geojson
    `,
    [req.body.nombre, req.body.descripcion ?? null, req.body.geojson ? JSON.stringify(req.body.geojson) : null]
  );
  res.status(201).json({ data: result.rows[0] });
}));

catalogRoutes.put("/zonas/:id", authenticateAdmin, requireRole("gestor", "administrador"), validate(idParams.merge(zoneBody)), asyncHandler(async (req, res) => {
  const result = await query(
    `
      update zonas
      set nombre = $2,
          descripcion = $3,
          geom = case when $4::jsonb is null then geom else st_setsrid(st_geomfromgeojson($4::text), 4326) end,
          updated_at = now()
      where id = $1
      returning id, nombre, descripcion, activo, created_at, updated_at, st_asgeojson(geom)::json as geojson
    `,
    [req.params.id, req.body.nombre, req.body.descripcion ?? null, req.body.geojson ? JSON.stringify(req.body.geojson) : null]
  );
  if (!result.rows[0]) throw new HttpError(404, "Zona no encontrada.");
  res.json({ data: result.rows[0] });
}));

catalogRoutes.patch("/zonas/:id/estado", authenticateAdmin, requireRole("gestor", "administrador"), validate(activeBody), asyncHandler(async (req, res) => {
  const result = await query(
    "update zonas set activo = $2, updated_at = now() where id = $1 returning *",
    [req.params.id, req.body.activo]
  );
  if (!result.rows[0]) throw new HttpError(404, "Zona no encontrada.");
  res.json({ data: result.rows[0] });
}));
