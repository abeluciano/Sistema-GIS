import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SpatialAnalysisPanel } from "./SpatialAnalysisPanel";

describe("SpatialAnalysisPanel", () => {
  test("shows global Moran and sends local results to the map", async () => {
    const runGlobal = vi.fn().mockResolvedValue({
      canRun: true,
      test: "Moran's I global",
      statistic: 0.3093,
      pValue: 0.005,
      sampleSize: 64,
      interpretation: "Existe evidencia de autocorrelacion espacial positiva.",
      warning: "No implica causalidad."
    });
    const localGeoJson = {
      type: "FeatureCollection" as const,
      tamanio_m: 500,
      analysis: {
        canRun: true,
        test: "Moran's I local",
        sampleSize: 64,
        significantUnits: 0,
        multipleTesting: "Benjamini-Hochberg FDR 0.05"
      },
      features: []
    };
    const runLocal = vi.fn().mockResolvedValue(localGeoJson);
    const onLayer = vi.fn();

    render(
      <SpatialAnalysisPanel
        runGlobal={runGlobal}
        runLocal={runLocal}
        runGetis={vi.fn()}
        onLayer={onLayer}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));
    expect(await screen.findByText("0.3093")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Pregunta de gestion"), { target: { value: "local" } });
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));
    await waitFor(() => expect(onLayer).toHaveBeenCalledWith("local", localGeoJson));
  });
});
