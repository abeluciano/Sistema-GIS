import { Router } from "express";
import { z } from "zod";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { authenticateFirebase } from "../middlewares/authFirebase.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const reportRoutes = Router();

const idParams = z.object({ params: z.object({ id: z.coerce.number().int().positive() }) });
const createReportSchema = z.object({
  body: z.object({
    categoria_id: z.coerce.number().int().positive(),
    urgencia: z.enum(["baja", "media", "alta", "critica"]),
    descripcion: z.string().min(5).max(2000),
    latitud: z.coerce.number().min(-90).max(90),
    longitud: z.coerce.number().min(-180).max(180),
    direccion_aprox: z.string().max(300).optional().nullable()
  })
});
const stateBody = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    estado: z.enum(["pendiente", "validado", "rechazado", "atendido", "archivado"]).optional(),
    comentario: z.string().max(1000).optional().nullable(),
    zona_id: z.coerce.number().int().positive().optional().nullable()
  })
});

function buildReportFilters(queryParams, values = []) {
  const filters = [];
  const allowed = {
    categoria_id: "r.categoria_id",
    urgencia: "r.urgencia",
    estado: "r.estado",
    zona_id: "r.zona_id"
  };

  for (const [key, column] of Object.entries(allowed)) {
    if (queryParams[key]) {
      values.push(queryParams[key]);
      filters.push(`${column} = $${values.length}`);
    }
  }

  if (queryParams.fecha_inicio) {
    values.push(queryParams.fecha_inicio);
    filters.push(`r.created_at >= $${values.length}`);
  }

  if (queryParams.fecha_fin) {
    values.push(queryParams.fecha_fin);
    filters.push(`r.created_at <= $${values.length}`);
  }

  return {
    where: filters.length > 0 ? `where ${filters.join(" and ")}` : "",
    values
  };
}

async function loadCitizen(req) {
  const user = await req.app.locals.repositories.user.findByFirebaseUid(req.firebaseUser.uid);
  if (!user || !user.activo) {
    throw new HttpError(403, "Debes sincronizar tu perfil ciudadano antes de registrar reportes.");
  }
  return user;
}

async function insertHistory({ reporteId, usuarioId, accion, estadoAnterior, estadoNuevo, comentario }) {
  await query(
    `
      insert into historial_reportes (reporte_id, usuario_id, accion, estado_anterior, estado_nuevo, comentario)
      values ($1, $2, $3, $4, $5, $6)
    `,
    [reporteId, usuarioId, accion, estadoAnterior ?? null, estadoNuevo ?? null, comentario ?? null]
  );
}

async function getReportById(id) {
  const result = await query(
    `
      select
        v.*,
        st_asgeojson(v.ubicacion)::json as geojson
      from vw_reportes_dashboard v
      where v.id = $1
      limit 1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

async function transitionReport(req, res, targetState, action) {
  if (!targetState) throw new HttpError(400, "Debes indicar el estado destino.");

  const current = await query("select id, estado from reportes where id = $1", [req.params.id]);
  const report = current.rows[0];
  if (!report) throw new HttpError(404, "Reporte no encontrado.");

  const result = await query(
    `
      update reportes
      set estado = $2,
          zona_id = coalesce($3, zona_id),
          validado_por = case when $2 = 'validado' then $4 else validado_por end,
          validado_at = case when $2 = 'validado' then now() else validado_at end,
          updated_at = now()
      where id = $1
      returning *
    `,
    [req.params.id, targetState, req.body.zona_id ?? null, Number(req.admin.id)]
  );

  await insertHistory({
    reporteId: req.params.id,
    usuarioId: Number(req.admin.id),
    accion: action,
    estadoAnterior: report.estado,
    estadoNuevo: targetState,
    comentario: req.body.comentario
  });

  res.json({ data: result.rows[0] });
}

reportRoutes.get("/reportes", authenticateAdmin, requireRole("gestor", "administrador"), asyncHandler(async (req, res) => {
  const { where, values } = buildReportFilters(req.query);
  const requestedPage = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(req.query.page_size ?? "10"), 10) || 10));
  const countResult = await query(
    `select count(*)::int as total from reportes r ${where}`,
    values
  );
  const total = Number(countResult.rows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const paginatedValues = [...values, pageSize, (page - 1) * pageSize];
  const result = await query(
    `
      select
        v.*,
        st_asgeojson(v.ubicacion)::json as geojson
      from vw_reportes_dashboard v
      join reportes r on r.id = v.id
      ${where}
      order by v.created_at desc
      limit $${paginatedValues.length - 1}
      offset $${paginatedValues.length}
    `,
    paginatedValues
  );

  res.json({
    data: result.rows,
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: totalPages
    }
  });
}));

reportRoutes.get("/reportes/:id", authenticateAdmin, requireRole("gestor", "administrador"), validate(idParams), asyncHandler(async (req, res) => {
  const report = await getReportById(req.params.id);
  if (!report) throw new HttpError(404, "Reporte no encontrado.");
  res.json({ data: report });
}));

reportRoutes.post("/reportes", authenticateFirebase, validate(createReportSchema), asyncHandler(async (req, res) => {
  const user = await loadCitizen(req);
  const result = await query(
    `
      insert into reportes (usuario_id, categoria_id, urgencia, descripcion, ubicacion, direccion_aprox)
      values ($1, $2, $3, $4, st_setsrid(st_makepoint($5, $6), 4326), $7)
      returning *
    `,
    [
      user.id,
      req.body.categoria_id,
      req.body.urgencia,
      req.body.descripcion,
      req.body.longitud,
      req.body.latitud,
      req.body.direccion_aprox ?? null
    ]
  );

  await insertHistory({
    reporteId: result.rows[0].id,
    usuarioId: user.id,
    accion: "creacion",
    estadoNuevo: "pendiente"
  });

  res.status(201).json({ data: result.rows[0] });
}));

reportRoutes.get("/mis-reportes", authenticateFirebase, asyncHandler(async (req, res) => {
  const user = await loadCitizen(req);
  const result = await query(
    `
      select v.*, st_asgeojson(v.ubicacion)::json as geojson
      from vw_reportes_dashboard v
      where v.usuario_id = $1
      order by v.created_at desc
      limit 100
    `,
    [user.id]
  );
  res.json({ data: result.rows });
}));

reportRoutes.patch("/reportes/:id/estado", authenticateAdmin, requireRole("gestor", "administrador"), validate(stateBody), asyncHandler(async (req, res) => {
  await transitionReport(req, res, req.body.estado, "cambio_estado");
}));

reportRoutes.patch("/reportes/:id/validar", authenticateAdmin, requireRole("gestor", "administrador"), validate(stateBody), asyncHandler(async (req, res) => {
  await transitionReport(req, res, "validado", "validacion");
}));

reportRoutes.patch("/reportes/:id/rechazar", authenticateAdmin, requireRole("gestor", "administrador"), validate(stateBody), asyncHandler(async (req, res) => {
  await transitionReport(req, res, "rechazado", "rechazo");
}));

reportRoutes.patch("/reportes/:id/atender", authenticateAdmin, requireRole("gestor", "administrador"), validate(stateBody), asyncHandler(async (req, res) => {
  await transitionReport(req, res, "atendido", "cambio_estado");
}));

reportRoutes.patch("/reportes/:id/archivar", authenticateAdmin, requireRole("gestor", "administrador"), validate(stateBody), asyncHandler(async (req, res) => {
  await transitionReport(req, res, "archivado", "archivado");
}));

reportRoutes.get("/reportes/:id/historial", authenticateAdmin, requireRole("gestor", "administrador"), validate(idParams), asyncHandler(async (req, res) => {
  const result = await query(
    `
      select h.*, u.nombre as usuario_nombre
      from historial_reportes h
      left join usuarios u on u.id = h.usuario_id
      where h.reporte_id = $1
      order by h.created_at asc
    `,
    [req.params.id]
  );
  res.json({ data: result.rows });
}));
