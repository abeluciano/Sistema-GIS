import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Report } from "../services/api";
import { ReportsTable } from "./ReportsTable";

const report: Report = {
  id: 27,
  usuario_id: 12,
  usuario_nombre: "Ciudadano",
  categoria_id: 1,
  categoria_nombre: "alumbrado_deficiente",
  urgencia: "media",
  descripcion: "Falta iluminacion en la avenida.",
  estado: "pendiente",
  created_at: "2026-07-08T17:00:00.000Z",
  updated_at: "2026-07-08T17:00:00.000Z"
};

describe("ReportsTable", () => {
  test("runs actions, opens detail and changes page", async () => {
    const onStateChange = vi.fn().mockResolvedValue(undefined);
    const onPageChange = vi.fn();

    render(
      <ReportsTable
        reports={[report]}
        pagination={{ page: 1, page_size: 5, total: 14, total_pages: 3 }}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
        onStateChange={onStateChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Validar reporte 27" }));
    await waitFor(() => expect(onStateChange).toHaveBeenCalledWith(27, "validado"));

    expect(screen.getByRole("button", { name: "Marcar atendido el reporte 27" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Ver detalle del reporte 27" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Falta iluminacion en la avenida.");

    fireEvent.click(screen.getByRole("button", { name: "Pagina siguiente" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
