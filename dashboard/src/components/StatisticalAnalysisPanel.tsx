import { Download, Play, Sigma } from "lucide-react";
import { useMemo, useState } from "react";
import type { AnalysisRequest, StatisticalResult } from "../services/api";

type AnalysisOption = {
  id: string;
  label: string;
  request: (state: AnalysisFormState) => AnalysisRequest;
  needsGroups?: "two-zones" | "two-categories";
  needsGroupBy?: boolean;
};

type AnalysisFormState = {
  fechaInicio: string;
  fechaFin: string;
  grupoA: string;
  grupoB: string;
  groupBy: "zona" | "categoria";
};

type StatisticalAnalysisPanelProps = {
  runAnalysis: (request: AnalysisRequest) => Promise<StatisticalResult>;
};

const options: AnalysisOption[] = [
  {
    id: "categoria-zona",
    label: "Asociacion entre categoria del incidente y zona",
    request: (state) => ({
      endpoint: "/analisis/estadistico/chi-cuadrado",
      params: { variableA: "categoria", variableB: "zona", fecha_inicio: state.fechaInicio, fecha_fin: state.fechaFin }
    })
  },
  {
    id: "estado-categoria",
    label: "Asociacion entre estado del reporte y categoria",
    request: (state) => ({
      endpoint: "/analisis/estadistico/chi-cuadrado",
      params: { variableA: "estado", variableB: "categoria", fecha_inicio: state.fechaInicio, fecha_fin: state.fechaFin }
    })
  },
  {
    id: "urgencia-zona",
    label: "Asociacion entre urgencia y zona",
    request: (state) => ({
      endpoint: "/analisis/estadistico/chi-cuadrado",
      params: { variableA: "urgencia", variableB: "zona", fecha_inicio: state.fechaInicio, fecha_fin: state.fechaFin }
    })
  },
  {
    id: "tiempo-dos-zonas",
    label: "Comparacion del tiempo de atencion entre dos zonas",
    needsGroups: "two-zones",
    request: (state) => ({
      endpoint: "/analisis/estadistico/mann-whitney",
      params: { groupBy: "zona", metric: "tiempo_atencion_horas", groups: [state.grupoA, state.grupoB].filter(Boolean).join(",") }
    })
  },
  {
    id: "tiempo-dos-categorias",
    label: "Comparacion del tiempo de atencion entre dos categorias",
    needsGroups: "two-categories",
    request: (state) => ({
      endpoint: "/analisis/estadistico/mann-whitney",
      params: { groupBy: "categoria", metric: "tiempo_atencion_horas", groups: [state.grupoA, state.grupoB].filter(Boolean).join(",") }
    })
  },
  {
    id: "tiempo-varios-grupos",
    label: "Comparacion del tiempo de atencion entre varias zonas o categorias",
    needsGroupBy: true,
    request: (state) => ({
      endpoint: "/analisis/estadistico/kruskal-wallis",
      params: { groupBy: state.groupBy }
    })
  },
  {
    id: "urgencia-tiempo",
    label: "Relacion entre urgencia y tiempo de atencion",
    request: () => ({ endpoint: "/analisis/estadistico/spearman" })
  },
  {
    id: "antes-despues",
    label: "Comparacion antes-despues por zona o periodo",
    request: () => ({ endpoint: "/analisis/estadistico/wilcoxon" })
  },
  {
    id: "evolucion-periodos",
    label: "Evolucion de indicadores en tres o mas periodos",
    request: () => ({ endpoint: "/analisis/estadistico/friedman" })
  }
];

function formatNumber(value: unknown) {
  return typeof value === "number" ? value.toFixed(4) : "-";
}

function csvValue(value: unknown) {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value).replaceAll('"', '""');
  return String(value).replaceAll('"', '""');
}

export function StatisticalAnalysisPanel({ runAnalysis }: StatisticalAnalysisPanelProps) {
  const [selectedId, setSelectedId] = useState(options[0].id);
  const [formState, setFormState] = useState<AnalysisFormState>({
    fechaInicio: "",
    fechaFin: "",
    grupoA: "",
    grupoB: "",
    groupBy: "zona"
  });
  const [result, setResult] = useState<StatisticalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedOption = useMemo(() => options.find((option) => option.id === selectedId) ?? options[0], [selectedId]);

  function update<K extends keyof AnalysisFormState>(key: K, value: AnalysisFormState[K]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  async function execute() {
    setLoading(true);
    setError("");
    try {
      const response = await runAnalysis(selectedOption.request(formState));
      setResult(response);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "No se pudo ejecutar el analisis.");
    } finally {
      setLoading(false);
    }
  }

  function exportResult() {
    if (!result) return;
    const rows = Object.entries(result).map(([key, value]) => `"${key}","${csvValue(value)}"`);
    const blob = new Blob([`campo,valor\n${rows.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "analisis-estadistico.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="panel statistics-panel" aria-label="Analisis estadistico">
      <header className="panel-header">
        <div>
          <h2>Analisis estadistico</h2>
          <p>Interpretacion exploratoria para gestion</p>
        </div>
        <Sigma size={22} />
      </header>
      <div className="statistics-form">
        <label className="wide-field">
          Analisis
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {options.map((option) => (
              <option value={option.id} key={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Desde
          <input type="date" value={formState.fechaInicio} onChange={(event) => update("fechaInicio", event.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={formState.fechaFin} onChange={(event) => update("fechaFin", event.target.value)} />
        </label>
        {selectedOption.needsGroups ? (
          <>
            <label>
              {selectedOption.needsGroups === "two-zones" ? "Zona 1" : "Categoria 1"}
              <input value={formState.grupoA} onChange={(event) => update("grupoA", event.target.value)} />
            </label>
            <label>
              {selectedOption.needsGroups === "two-zones" ? "Zona 2" : "Categoria 2"}
              <input value={formState.grupoB} onChange={(event) => update("grupoB", event.target.value)} />
            </label>
          </>
        ) : null}
        {selectedOption.needsGroupBy ? (
          <label>
            Agrupar por
            <select value={formState.groupBy} onChange={(event) => update("groupBy", event.target.value as AnalysisFormState["groupBy"])}>
              <option value="zona">Zona</option>
              <option value="categoria">Categoria</option>
            </select>
          </label>
        ) : null}
        <div className="statistics-actions">
          <button type="button" className="primary-button" onClick={execute} disabled={loading}>
            <Play size={17} />
            <span>{loading ? "Ejecutando" : "Ejecutar"}</span>
          </button>
          <button type="button" className="secondary-button" onClick={exportResult} disabled={!result}>
            <Download size={17} />
            <span>CSV</span>
          </button>
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {result ? (
        <div className="statistics-result">
          <strong>{result.canRun === false ? "No ejecutable" : "Resultado disponible"}</strong>
          <dl>
            <div>
              <dt>p-value</dt>
              <dd>{formatNumber(result.pValue)}</dd>
            </div>
            <div>
              <dt>Estadistico</dt>
              <dd>{formatNumber(result.statistic ?? result.rho)}</dd>
            </div>
            <div>
              <dt>Muestra</dt>
              <dd>{String(result.sampleSize ?? result.sampleSizes ?? "-")}</dd>
            </div>
          </dl>
          <p>{result.interpretation ?? result.message ?? "Resultado recibido."}</p>
          <p className="method-note">No implica causalidad. Prueba utilizada: {result.test ?? "detalle no disponible"}.</p>
        </div>
      ) : null}
    </section>
  );
}
