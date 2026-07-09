import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatisticalAnalysisPanel } from "./StatisticalAnalysisPanel";

describe("StatisticalAnalysisPanel", () => {
  it("prioriza preguntas de gestion y ejecuta la prueba correspondiente internamente", async () => {
    const runAnalysis = vi.fn().mockResolvedValue({
      canRun: true,
      test: "Chi-cuadrado",
      pValue: 0.0312,
      statistic: 9.5,
      sampleSize: 80,
      interpretation: "Existe evidencia estadistica de asociacion."
    });

    render(<StatisticalAnalysisPanel categories={[]} zones={[]} runAnalysis={runAnalysis} />);

    expect(screen.getByText("Asociacion entre categoria del incidente y zona")).toBeInTheDocument();
    expect(screen.queryByText("Chi-cuadrado")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ejecutar/i }));

    await waitFor(() => expect(runAnalysis).toHaveBeenCalledWith({
      endpoint: "/analisis/estadistico/chi-cuadrado",
      params: {
        variableA: "categoria",
        variableB: "zona",
        fecha_inicio: "",
        fecha_fin: "",
        zona_id: "",
        categoria_id: "",
        estado: ""
      }
    }));
    expect(await screen.findByText(/Prueba utilizada: Chi-cuadrado/i)).toBeInTheDocument();
    expect(screen.getByText(/No implica causalidad/i)).toBeInTheDocument();
  });
});
