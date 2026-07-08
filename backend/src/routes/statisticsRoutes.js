import { Router } from "express";
import { query } from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { requireRole } from "../middlewares/requireRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import {
  chiSquaredTest,
  kruskalWallisTest,
  mannWhitneyTest,
  mapUrgency,
  spearmanCorrelation
} from "../services/statisticsService.js";

export const statisticsRoutes = Router();

statisticsRoutes.use(authenticateAdmin, requireRole("gestor", "administrador"));

const categoricalVariables = {
  categoria: "c.nombre",
  zona: "coalesce(z.nombre, 'Sin zona')",
  estado: "r.estado",
  urgencia: "r.urgencia"
};

function dateFilter(req, values) {
  const filters = [];
  if (req.query.fecha_inicio) {
    values.push(req.query.fecha_inicio);
    filters.push(`r.created_at::date >= $${values.length}::date`);
  }
  if (req.query.fecha_fin) {
    values.push(req.query.fecha_fin);
    filters.push(`r.created_at::date <= $${values.length}::date`);
  }
  return filters;
}

statisticsRoutes.get("/analisis/estadistico/chi-cuadrado", asyncHandler(async (req, res) => {
  const variableA = req.query.variableA ?? "categoria";
  const variableB = req.query.variableB ?? "zona";
  const columnA = categoricalVariables[variableA];
  const columnB = categoricalVariables[variableB];
  if (!columnA || !columnB || variableA === variableB) throw new HttpError(400, "Variables categoricas no validas.");

  const values = [];
  const filters = dateFilter(req, values);
  const where = filters.length > 0 ? `where ${filters.join(" and ")}` : "";
  const result = await query(`
    select ${columnA} as variable_a, ${columnB} as variable_b, count(*)::int as total
    from reportes r
    left join categorias c on c.id = r.categoria_id
    left join zonas z on z.id = r.zona_id
    ${where}
    group by variable_a, variable_b
  `, values);

  const analysis = chiSquaredTest(result.rows);
  if (!analysis.canRun) return res.status(422).json(analysis);
  res.json({ analysis: "Asociacion entre variables categoricas", ...analysis });
}));

statisticsRoutes.get("/analisis/estadistico/mann-whitney", asyncHandler(async (req, res) => {
  const groupBy = req.query.groupBy ?? "zona";
  const metric = req.query.metric ?? "tiempo_atencion_horas";
  const groups = String(req.query.groups ?? "").split(",").filter(Boolean);
  if (!["zona", "categoria"].includes(groupBy) || metric !== "tiempo_atencion_horas" || groups.length !== 2) {
    throw new HttpError(400, "Selecciona dos zonas o dos categorias y la metrica tiempo_atencion_horas.");
  }

  const labelColumn = groupBy === "zona" ? "coalesce(z.nombre, 'Sin zona')" : "c.nombre";
  const result = await query(`
    select ${labelColumn} as label,
           extract(epoch from (coalesce(r.validado_at, r.updated_at) - r.created_at)) / 3600 as value
    from reportes r
    left join categorias c on c.id = r.categoria_id
    left join zonas z on z.id = r.zona_id
    where r.estado in ('validado', 'atendido', 'archivado')
      and ${labelColumn} = any($1)
      and coalesce(r.validado_at, r.updated_at) is not null
  `, [groups]);

  const grouped = groups.map((label) => ({
    label,
    values: result.rows.filter((row) => row.label === label).map((row) => Number(row.value))
  }));
  const analysis = mannWhitneyTest(grouped);
  if (!analysis.canRun) return res.status(422).json(analysis);
  res.json({ analysis: "Comparacion entre dos grupos independientes", ...analysis });
}));

statisticsRoutes.get("/analisis/estadistico/kruskal-wallis", asyncHandler(async (req, res) => {
  const groupBy = req.query.groupBy ?? "zona";
  if (!["zona", "categoria"].includes(groupBy)) throw new HttpError(400, "Agrupacion no valida.");

  const labelColumn = groupBy === "zona" ? "coalesce(z.nombre, 'Sin zona')" : "c.nombre";
  const result = await query(`
    select ${labelColumn} as label,
           extract(epoch from (coalesce(r.validado_at, r.updated_at) - r.created_at)) / 3600 as value
    from reportes r
    left join categorias c on c.id = r.categoria_id
    left join zonas z on z.id = r.zona_id
    where r.estado in ('validado', 'atendido', 'archivado')
      and coalesce(r.validado_at, r.updated_at) is not null
  `);

  const labels = [...new Set(result.rows.map((row) => row.label))];
  const grouped = labels.map((label) => ({
    label,
    values: result.rows.filter((row) => row.label === label).map((row) => Number(row.value))
  }));
  const analysis = kruskalWallisTest(grouped);
  if (!analysis.canRun) return res.status(422).json(analysis);
  res.json({ analysis: "Comparacion entre tres o mas grupos independientes", ...analysis });
}));

statisticsRoutes.get("/analisis/estadistico/spearman", asyncHandler(async (_req, res) => {
  const result = await query(`
    select r.urgencia,
           extract(epoch from (coalesce(r.validado_at, r.updated_at) - r.created_at)) / 3600 as tiempo_atencion_horas
    from reportes r
    where r.estado in ('validado', 'atendido', 'archivado')
      and coalesce(r.validado_at, r.updated_at) is not null
  `);

  const pairs = result.rows
    .map((row) => ({ x: mapUrgency(row.urgencia), y: Number(row.tiempo_atencion_horas) }))
    .filter((pair) => pair.x !== null && Number.isFinite(pair.y));
  const analysis = spearmanCorrelation(pairs);
  if (!analysis.canRun) return res.status(422).json(analysis);
  res.json({ analysis: "Relacion entre urgencia y tiempo de atencion", ...analysis });
}));

statisticsRoutes.get("/analisis/estadistico/wilcoxon", (_req, res) => {
  res.status(501).json({
    canRun: false,
    test: "Wilcoxon",
    message: "Prueba preparada para fases posteriores. Requiere datos pareados antes-despues suficientes."
  });
});

statisticsRoutes.get("/analisis/estadistico/friedman", (_req, res) => {
  res.status(501).json({
    canRun: false,
    test: "Friedman",
    message: "Prueba preparada para fases posteriores. Requiere tres o mas mediciones relacionadas por zona o periodo."
  });
});
