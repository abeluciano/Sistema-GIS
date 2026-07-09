import { Router } from "express";
import { z } from "zod";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { localAnalysisGeoJson, runSpatialAnalysis } from "../services/spatialAnalysisService.js";

export const spatialStatisticsRoutes = Router();

const spatialQuery = z.object({
  query: z.object({
    tamanio: z.coerce.number().int().refine((value) => [250, 500].includes(value)).default(500),
    estado: z.enum(["pendiente", "validado", "rechazado", "atendido", "archivado"]).optional(),
    categoria_id: z.coerce.number().int().positive().optional(),
    zona_id: z.coerce.number().int().positive().optional(),
    fecha_inicio: z.iso.date().optional(),
    fecha_fin: z.iso.date().optional()
  })
});

spatialStatisticsRoutes.use(authenticateAdmin, requireRole("gestor", "administrador"));

spatialStatisticsRoutes.get("/analisis/espacial/moran", validate(spatialQuery), asyncHandler(async (req, res) => {
  const { analysis } = await runSpatialAnalysis("moran_global", req.validatedQuery);
  res.status(analysis.canRun ? 200 : 422).json(analysis);
}));

spatialStatisticsRoutes.get("/analisis/espacial/moran-local.geojson", validate(spatialQuery), asyncHandler(async (req, res) => {
  const { analysis, units } = await runSpatialAnalysis("moran_local", req.validatedQuery);
  const geojson = localAnalysisGeoJson(analysis, units, {
    tamanio_m: req.validatedQuery.tamanio
  });
  res.status(analysis.canRun ? 200 : 422).json(geojson);
}));

spatialStatisticsRoutes.get("/analisis/espacial/getis-ord.geojson", validate(spatialQuery), asyncHandler(async (req, res) => {
  const { analysis, units } = await runSpatialAnalysis("getis_ord", req.validatedQuery);
  const geojson = localAnalysisGeoJson(analysis, units, {
    tamanio_m: req.validatedQuery.tamanio
  });
  res.status(analysis.canRun ? 200 : 422).json(geojson);
}));
