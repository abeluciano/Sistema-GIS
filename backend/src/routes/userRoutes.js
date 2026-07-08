import { Router } from "express";
import { z } from "zod";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const userRoutes = Router();

const idParams = z.object({ params: z.object({ id: z.coerce.number().int().positive() }) });
const roleBody = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ rol: z.enum(["ciudadano", "gestor", "administrador"]) })
});
const activeBody = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ activo: z.boolean() })
});

userRoutes.use(authenticateAdmin);

userRoutes.get("/usuarios", requireRole("gestor", "administrador"), asyncHandler(async (req, res) => {
  const users = await req.app.locals.repositories.user.list(req.query);
  res.json({ data: users });
}));

userRoutes.get("/usuarios/:id", requireRole("gestor", "administrador"), validate(idParams), asyncHandler(async (req, res) => {
  const user = await req.app.locals.repositories.user.findById(req.params.id);
  if (!user) throw new HttpError(404, "Usuario no encontrado.");
  res.json({ data: user });
}));

userRoutes.patch("/usuarios/:id/rol", requireRole("administrador"), validate(roleBody), asyncHandler(async (req, res) => {
  const user = await req.app.locals.repositories.user.updateRole(req.params.id, req.body.rol);
  if (!user) throw new HttpError(404, "Usuario no encontrado.");
  res.json({ data: user });
}));

userRoutes.patch("/usuarios/:id/estado", requireRole("administrador"), validate(activeBody), asyncHandler(async (req, res) => {
  const user = await req.app.locals.repositories.user.updateActive(req.params.id, req.body.activo);
  if (!user) throw new HttpError(404, "Usuario no encontrado.");
  res.json({ data: user });
}));
