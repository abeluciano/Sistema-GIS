import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { extname, isAbsolute, join, resolve, sep } from "node:path";
import multer from "multer";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { authenticateFirebase } from "../middlewares/authFirebase.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const photoRoutes = Router();

const idParams = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    fotoId: z.coerce.number().int().positive().optional()
  })
});

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const uploadsRoot = isAbsolute(env.UPLOADS_DIR)
  ? resolve(env.UPLOADS_DIR)
  : resolve(process.cwd(), env.UPLOADS_DIR.replace(/^backend[\\/]/, ""));

const storage = multer.diskStorage({
  destination(req, _file, callback) {
    const directory = join(uploadsRoot, "reportes", String(req.params.id));
    mkdirSync(directory, { recursive: true });
    callback(null, directory);
  },
  filename(_req, file, callback) {
    const extension = extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    const extension = extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      return callback(new HttpError(400, "Tipo de archivo no permitido."));
    }
    return callback(null, true);
  }
});

async function canAttachCitizenPhoto(req, reportId) {
  const user = await req.app.locals.repositories.user.findByFirebaseUid(req.firebaseUser.uid);
  if (!user) throw new HttpError(403, "Perfil ciudadano no sincronizado.");

  const result = await query("select id from reportes where id = $1 and usuario_id = $2", [reportId, user.id]);
  if (!result.rows[0]) throw new HttpError(404, "Reporte no encontrado para este ciudadano.");

  return user;
}

async function countPhotos(reportId) {
  const result = await query("select count(*)::int as total from reporte_fotos where reporte_id = $1", [reportId]);
  return result.rows[0]?.total ?? 0;
}

photoRoutes.post(
  "/reportes/:id/fotos",
  authenticateFirebase,
  validate(idParams),
  asyncHandler(async (req, _res, next) => {
    const total = await countPhotos(req.params.id);
    if (total >= env.MAX_REPORT_PHOTOS) throw new HttpError(400, "El reporte ya tiene el maximo de fotografias permitido.");
    await canAttachCitizenPhoto(req, req.params.id);
    next();
  }),
  upload.single("foto"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, "Debes adjuntar una fotografia.");

    const rutaRelativa = `reportes/${req.params.id}/${req.file.filename}`;
    const result = await query(
      "insert into reporte_fotos (reporte_id, ruta_relativa, descripcion) values ($1, $2, $3) returning *",
      [req.params.id, rutaRelativa, req.body.descripcion ?? null]
    );

    const user = await req.app.locals.repositories.user.findByFirebaseUid(req.firebaseUser.uid);
    await query(
      "insert into historial_reportes (reporte_id, usuario_id, accion, comentario) values ($1, $2, 'agregar_foto', $3)",
      [req.params.id, user.id, "Fotografia agregada por ciudadano"]
    );

    res.status(201).json({ data: result.rows[0] });
  })
);

photoRoutes.get("/reportes/:id/fotos", authenticateAdmin, requireRole("gestor", "administrador"), validate(idParams), asyncHandler(async (req, res) => {
  const result = await query(
    "select * from reporte_fotos where reporte_id = $1 order by created_at asc",
    [req.params.id]
  );
  res.json({ data: result.rows });
}));

photoRoutes.get("/reportes/:id/fotos/:fotoId/archivo", authenticateAdmin, requireRole("gestor", "administrador"), validate(idParams), asyncHandler(async (req, res) => {
  const result = await query(
    "select * from reporte_fotos where id = $1 and reporte_id = $2",
    [req.params.fotoId, req.params.id]
  );
  const photo = result.rows[0];
  if (!photo) throw new HttpError(404, "Fotografia no encontrada.");

  const absolutePath = resolve(uploadsRoot, photo.ruta_relativa);
  if (!absolutePath.startsWith(`${uploadsRoot}${sep}`)) {
    throw new HttpError(400, "Ruta de fotografia no valida.");
  }

  res.type(extname(absolutePath)).sendFile(absolutePath);
}));

photoRoutes.delete("/reportes/:id/fotos/:fotoId", authenticateAdmin, requireRole("gestor", "administrador"), validate(idParams), asyncHandler(async (req, res) => {
  const result = await query(
    "delete from reporte_fotos where id = $1 and reporte_id = $2 returning *",
    [req.params.fotoId, req.params.id]
  );
  const photo = result.rows[0];
  if (!photo) throw new HttpError(404, "Fotografia no encontrada.");

  const absolutePath = resolve(uploadsRoot, photo.ruta_relativa);
  if (absolutePath.startsWith(`${uploadsRoot}${sep}`)) {
    await unlink(absolutePath).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }

  await query(
    "insert into historial_reportes (reporte_id, usuario_id, accion, comentario) values ($1, $2, 'eliminar_foto', $3)",
    [req.params.id, Number(req.admin.id), "Fotografia eliminada desde dashboard"]
  );

  res.status(204).send();
}));
