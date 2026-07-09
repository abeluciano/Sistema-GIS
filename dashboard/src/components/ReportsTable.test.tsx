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
    const onLoadPhotos = vi.fn().mockResolvedValue([{
      id: 9,
      reporte_id: 27,
      ruta_relativa: "reportes/27/evidencia.jpg",
      created_at: "2026-07-08T17:00:00.000Z",
      url: "blob:evidencia"
    }]);
    const onDeletePhoto = vi.fn().mockResolvedValue(undefined);

    render(
      <ReportsTable
        reports={[report]}
        pagination={{ page: 1, page_size: 5, total: 14, total_pages: 3 }}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
        onStateChange={onStateChange}
        onLoadPhotos={onLoadPhotos}
        onDeletePhoto={onDeletePhoto}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Validar reporte 27" }));
    await waitFor(() => expect(onStateChange).toHaveBeenCalledWith(27, "validado"));

    expect(screen.getByRole("button", { name: "Marcar atendido el reporte 27" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Ver detalle del reporte 27" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Falta iluminacion en la avenida.");
    expect(await screen.findByRole("img", { name: "Evidencia del reporte 27" })).toHaveAttribute("src", "blob:evidencia");
    fireEvent.click(screen.getByRole("button", { name: "Eliminar fotografia 9" }));
    await waitFor(() => expect(onDeletePhoto).toHaveBeenCalledWith(27, 9));

    fireEvent.click(screen.getByRole("button", { name: "Pagina siguiente" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
