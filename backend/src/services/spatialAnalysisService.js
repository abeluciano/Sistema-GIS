import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { query } from "../config/database.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const workerPath = fileURLToPath(new URL("../../../analytics/spatial_stats.py", import.meta.url));

export async function loadSpatialUnits(filters) {
  const values = [
    filters.tamanio,
    filters.estado ?? null,
    filters.categoria_id ?? null,
    filters.zona_id ?? null,
    filters.fecha_inicio ?? null,
    filters.fecha_fin ?? null
  ];
  const result = await query(`
    with filtered_reports as (
      select r.id, r.ubicacion
      from reportes r
      where ($2::varchar is null or r.estado = $2::varchar)
        and ($3::int is null or r.categoria_id = $3::int)
        and ($4::int is null or r.zona_id = $4::int)
        and ($5::date is null or r.created_at::date >= $5::date)
        and ($6::date is null or r.created_at::date <= $6::date)
    ),
    assignments as (
      select
        r.id as reporte_id,
        (
          select u.id
          from unidades_espaciales u
          where u.tamanio_m = $1::int
            and st_covers(u.geom, r.ubicacion)
          order by u.id
          limit 1
        ) as unidad_id
      from filtered_reports r
    ),
    counts as (
      select unidad_id, count(*)::int as total
      from assignments
      where unidad_id is not null
      group by unidad_id
    )
    select
      u.id,
      u.codigo,
      coalesce(c.total, 0)::int as value,
      st_asgeojson(u.geom)::json as geometry,
      coalesce(
        (select jsonb_agg(v.vecino_id order by v.vecino_id)
         from unidad_vecinos v
         where v.unidad_id = u.id),
        '[]'::jsonb
      ) as neighbors
    from unidades_espaciales u
    left join counts c on c.unidad_id = u.id
    where u.tamanio_m = $1::int
    order by u.id
  `, values);

  return result.rows.map((row) => ({
    id: row.id,
    codigo: row.codigo,
    value: row.value,
    geometry: row.geometry,
    neighbors: row.neighbors
  }));
}

function runWorker(payload) {
  return new Promise((resolve, reject) => {
    const child = spawn(env.PYTHON_BIN, [workerPath], {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new HttpError(504, "El analisis espacial excedio el tiempo permitido."));
    }, 60_000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", () => {
      clearTimeout(timeout);
      reject(new HttpError(503, "El motor estadistico espacial no esta disponible."));
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new HttpError(500, "El motor estadistico espacial fallo.", stderr.trim()));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new HttpError(500, "El motor estadistico devolvio una respuesta no valida."));
      }
    });

    child.stdin.end(JSON.stringify(payload));
  });
}

export async function runSpatialAnalysis(method, filters) {
  const units = await loadSpatialUnits(filters);
  const analysis = await runWorker({
    method,
    permutations: env.SPATIAL_PERMUTATIONS,
    units: units.map(({ geometry: _geometry, ...unit }) => unit)
  });
  return { analysis, units };
}

export function localAnalysisGeoJson(analysis, units, metadata = {}) {
  const byId = new Map((analysis.data ?? []).map((row) => [row.id, row]));
  return {
    type: "FeatureCollection",
    ...metadata,
    analysis: {
      canRun: analysis.canRun,
      test: analysis.test,
      method: analysis.method,
      sampleSize: analysis.sampleSize,
      permutations: analysis.permutations,
      multipleTesting: analysis.multipleTesting,
      significantUnits: analysis.significantUnits,
      interpretation: analysis.interpretation,
      warning: analysis.warning,
      message: analysis.message
    },
    features: analysis.canRun
      ? units.map((unit) => ({
          type: "Feature",
          geometry: unit.geometry,
          properties: { codigo: unit.codigo, ...(byId.get(unit.id) ?? {}) }
        }))
      : []
  };
}
