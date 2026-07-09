import { Download, Play } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PeriodComparisonConfig, PeriodComparisonResult } from "../services/api";

type TemporalComparisonPanelProps = {
  runComparison: (config: PeriodComparisonConfig) => Promise<PeriodComparisonResult>;
  exportComparison: (config: PeriodComparisonConfig) => Promise<void>;
};

function dateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function initialConfig(): PeriodComparisonConfig {
  const periodBEnd = new Date();
  const periodBStart = new Date(periodBEnd);
  periodBStart.setDate(periodBStart.getDate() - 29);
  const periodAEnd = new Date(periodBStart);
  periodAEnd.setDate(periodAEnd.getDate() - 1);
  const periodAStart = new Date(periodAEnd);
  periodAStart.setDate(periodAStart.getDate() - 29);

  return {
    periodo_a_inicio: dateValue(periodAStart),
    periodo_a_fin: dateValue(periodAEnd),
    periodo_b_inicio: dateValue(periodBStart),
    periodo_b_fin: dateValue(periodBEnd),
    agrupar: "zona"
  };
}

export function TemporalComparisonPanel({ runComparison, exportComparison }: TemporalComparisonPanelProps) {
  const [config, setConfig] = useState(initialConfig);
  const [result, setResult] = useState<PeriodComparisonResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof PeriodComparisonConfig>(key: K, value: PeriodComparisonConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  async function execute() {
    setLoading(true);
    setError("");
    try {
      setResult(await runComparison(config));
    } catch (comparisonError) {
      setError(comparisonError instanceof Error ? comparisonError.message : "No se pudo comparar los periodos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel comparison-panel" aria-label="Comparacion temporal">
      <header className="panel-header">
        <div>
          <h2>Comparacion temporal</h2>
          <p>Contrasta volumen entre dos intervalos</p>
        </div>
      </header>
      <div className="comparison-form">
        <label>
          Periodo A desde
          <input type="date" value={config.periodo_a_inicio} onChange={(event) => update("periodo_a_inicio", event.target.value)} />
        </label>
        <label>
          Periodo A hasta
          <input type="date" value={config.periodo_a_fin} onChange={(event) => update("periodo_a_fin", event.target.value)} />
        </label>
        <label>
          Periodo B desde
          <input type="date" value={config.periodo_b_inicio} onChange={(event) => update("periodo_b_inicio", event.target.value)} />
        </label>
        <label>
          Periodo B hasta
          <input type="date" value={config.periodo_b_fin} onChange={(event) => update("periodo_b_fin", event.target.value)} />
        </label>
        <label>
          Desglosar por
          <select value={config.agrupar} onChange={(event) => update("agrupar", event.target.value as PeriodComparisonConfig["agrupar"])}>
            <option value="zona">Zona</option>
            <option value="categoria">Categoria</option>
            <option value="estado">Estado</option>
          </select>
        </label>
        <div className="comparison-actions">
          <button type="button" className="primary-button" onClick={execute} disabled={loading}>
            <Play size={17} />
            <span>{loading ? "Comparando" : "Comparar"}</span>
          </button>
          <button type="button" className="secondary-button" onClick={() => void exportComparison(config)}>
            <Download size={17} />
            <span>CSV</span>
          </button>
        </div>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {result ? (
        <>
          <div className="comparison-summary">
            <div><span>Periodo A</span><strong>{result.resumen.periodo_a}</strong></div>
            <div><span>Periodo B</span><strong>{result.resumen.periodo_b}</strong></div>
            <div><span>Diferencia</span><strong>{result.resumen.diferencia}</strong></div>
            <div>
              <span>Variacion</span>
              <strong>{result.resumen.variacion_porcentual == null ? "Sin base" : `${result.resumen.variacion_porcentual}%`}</strong>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={result.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar name="Periodo A" dataKey="periodo_a" fill="#007c89" />
              <Bar name="Periodo B" dataKey="periodo_b" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
          <div className="comparison-interpretation">
            <p>{result.interpretation}</p>
            <small>{result.warning}</small>
          </div>
        </>
      ) : null}
    </section>
  );
}
