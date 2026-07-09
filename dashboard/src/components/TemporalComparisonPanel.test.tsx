import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { TemporalComparisonPanel } from "./TemporalComparisonPanel";

describe("TemporalComparisonPanel", () => {
  test("compares periods and exports the selected configuration", async () => {
    const runComparison = vi.fn().mockResolvedValue({
      periodos: {
        a: { inicio: "2026-05-01", fin: "2026-05-31" },
        b: { inicio: "2026-06-01", fin: "2026-06-30" }
      },
      agrupacion: "zona",
      resumen: { periodo_a: 4, periodo_b: 8, diferencia: 4, variacion_porcentual: 100 },
      data: [{ nombre: "Sector A", periodo_a: 4, periodo_b: 8, diferencia: 4, variacion_porcentual: 100 }],
      interpretation: "El segundo periodo registra un mayor volumen de reportes.",
      warning: "No implica causalidad."
    });
    const exportComparison = vi.fn().mockResolvedValue(undefined);

    render(
      <TemporalComparisonPanel
        runComparison={runComparison}
        exportComparison={exportComparison}
      />
    );

    fireEvent.change(screen.getByLabelText("Desglosar por"), { target: { value: "categoria" } });
    fireEvent.click(screen.getByRole("button", { name: "Comparar" }));
    await waitFor(() => expect(runComparison).toHaveBeenCalledWith(
      expect.objectContaining({ agrupar: "categoria" })
    ));
    expect(await screen.findByText("100%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "CSV" }));
    expect(exportComparison).toHaveBeenCalledWith(expect.objectContaining({ agrupar: "categoria" }));
  });
});
