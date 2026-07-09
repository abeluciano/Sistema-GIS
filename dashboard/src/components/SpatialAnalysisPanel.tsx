import { MapPinned, Play } from "lucide-react";
import { useState } from "react";
import type { SpatialGeoJson, SpatialGlobalResult } from "../services/api";

type AnalysisMode = "global" | "local" | "getis";

type SpatialAnalysisPanelProps = {
  runGlobal: (size: 250 | 500) => Promise<SpatialGlobalResult>;
  runLocal: (size: 250 | 500) => Promise<SpatialGeoJson>;
  runGetis: (size: 250 | 500) => Promise<SpatialGeoJson>;
  onLayer: (mode: "local" | "getis", data: SpatialGeoJson) => void;
};

export function SpatialAnalysisPanel({ runGlobal, runLocal, runGetis, onLayer }: SpatialAnalysisPanelProps) {
  const [mode, setMode] = useState<AnalysisMode>("global");
  const [size, setSize] = useState<250 | 500>(500);
  const [result, setResult] = useState<SpatialGlobalResult>();
  const [layerResult, setLayerResult] = useState<SpatialGeoJson["analysis"]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function execute() {
    setLoading(true);
    setError("");
    setResult(undefined);
    setLayerResult(undefined);
    try {
      if (mode === "global") {
        setResult(await runGlobal(size));
      } else {
        const response = mode === "local" ? await runLocal(size) : await runGetis(size);
        setLayerResult(response.analysis);
        if (response.analysis.canRun) onLayer(mode, response);
      }
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "No se pudo ejecutar el analisis espacial.");
    } finally {
      setLoading(false);
    }
  }

  const activeResult = result ?? layerResult;

  return (
    <section className="panel spatial-analysis-panel" aria-label="Analisis espacial">
      <header className="panel-header">
        <div>
          <h2>Analisis espacial</h2>
          <p>Autocorrelacion y concentraciones con significancia</p>
        </div>
        <MapPinned size={22} />
      </header>
      <div className="spatial-analysis-form">
        <label>
          Pregunta de gestion
          <select value={mode} onChange={(event) => setMode(event.target.value as AnalysisMode)}>
            <option value="global">Existe agrupacion espacial general?</option>
            <option value="local">Donde se agrupan valores altos o bajos?</option>
            <option value="getis">Donde hay concentraciones significativas?</option>
          </select>
        </label>
        <label>
          Escala territorial
          <select value={size} onChange={(event) => setSize(Number(event.target.value) as 250 | 500)}>
            <option value={500}>500 metros</option>
            <option value={250}>250 metros</option>
          </select>
        </label>
        <button type="button" className="primary-button" onClick={execute} disabled={loading}>
          <Play size={17} />
          <span>{loading ? "Calculando" : "Ejecutar"}</span>
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {activeResult ? (
        <div className="spatial-analysis-result">
          <strong>{activeResult.canRun ? "Resultado disponible" : "No ejecutable"}</strong>
          {result?.canRun ? (
            <dl>
              <div><dt>Moran's I</dt><dd>{result.statistic?.toFixed(4) ?? "-"}</dd></div>
              <div><dt>p-value</dt><dd>{result.pValue?.toFixed(4) ?? "-"}</dd></div>
              <div><dt>Unidades</dt><dd>{result.sampleSize ?? "-"}</dd></div>
            </dl>
          ) : null}
          {layerResult?.canRun ? (
            <dl>
              <div><dt>Unidades</dt><dd>{layerResult.sampleSize ?? "-"}</dd></div>
              <div><dt>Significativas</dt><dd>{layerResult.significantUnits ?? 0}</dd></div>
              <div><dt>Correccion</dt><dd>{layerResult.multipleTesting ?? "-"}</dd></div>
            </dl>
          ) : null}
          <p>{activeResult.interpretation ?? activeResult.message}</p>
          <small>{activeResult.warning}</small>
          <p className="method-note">Detalle metodologico: {activeResult.test ?? "analisis espacial"}.</p>
        </div>
      ) : null}
    </section>
  );
}
