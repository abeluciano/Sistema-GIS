import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Report } from "../services/api";
import { FiltersBar } from "./FiltersBar";
import { LoginPanel } from "./LoginPanel";
import { ReportsTable } from "./ReportsTable";

const baseReport: Report = {
  id: 1,
  usuario_id: 1,
  categoria_id: 1,
  categoria_nombre: "robo",
  urgencia: "media",
  descripcion: "Descripcion operativa",
  estado: "pendiente",
  created_at: "2026-07-08T17:00:00.000Z",
  updated_at: "2026-07-08T17:00:00.000Z"
};

const pagination = { page: 1, page_size: 5, total: 14, total_pages: 3 };

describe("dashboard functional and rendering coverage", () => {
  test("renders the administrative login form", () => {
    render(<LoginPanel onLogin={vi.fn()} />);
    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Contrasena")).toBeInTheDocument();
  });

  test("submits administrative credentials", async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<LoginPanel onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Contrasena"), { target: { value: "admin" } });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith("admin", "admin"));
  });

  test("runs refresh from the filters toolbar", () => {
    const onRefresh = vi.fn();
    render(<FiltersBar categories={[]} zones={[]} filters={{}} onChange={vi.fn()} onSearch={vi.fn()} onRefresh={onRefresh} onExport={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  test("runs CSV export from the filters toolbar", () => {
    const onExport = vi.fn();
    render(<FiltersBar categories={[]} zones={[]} filters={{}} onChange={vi.fn()} onSearch={vi.fn()} onRefresh={vi.fn()} onExport={onExport} />);
    fireEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  test("changes the report page size", () => {
    const onPageSizeChange = vi.fn();
    render(<ReportsTable reports={[baseReport]} pagination={pagination} onPageChange={vi.fn()} onPageSizeChange={onPageSizeChange} onStateChange={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Filas"), { target: { value: "10" } });
    expect(onPageSizeChange).toHaveBeenCalledWith(10);
  });

  test("disables previous navigation on the first page", () => {
    render(<ReportsTable reports={[baseReport]} pagination={pagination} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} onStateChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Pagina anterior" })).toBeDisabled();
  });

  test("opens and closes a report detail dialog", () => {
    render(<ReportsTable reports={[baseReport]} pagination={pagination} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} onStateChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Ver detalle del reporte 1" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar detalle" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders a page with 25 reports within the performance budget", () => {
    const reports = Array.from({ length: 25 }, (_, index) => ({ ...baseReport, id: index + 1 }));
    const started = performance.now();
    render(
      <ReportsTable
        reports={reports}
        pagination={{ page: 1, page_size: 25, total: 1000, total_pages: 40 }}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onStateChange={vi.fn()}
      />
    );
    const elapsed = performance.now() - started;
    console.log(`[METRIC] Dashboard render 25 rows: ${elapsed.toFixed(2)} ms`);
    expect(screen.getAllByRole("row")).toHaveLength(26);
    expect(elapsed).toBeLessThan(1000);
  });
});
