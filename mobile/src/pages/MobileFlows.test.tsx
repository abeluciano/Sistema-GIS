import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { DetailReportPage } from "./DetailReportPage";
import { EmergencyPage } from "./EmergencyPage";
import { HomePage } from "./HomePage";
import { NewReportPage } from "./NewReportPage";

const mocks = vi.hoisted(() => ({
  getCategories: vi.fn(),
  createReport: vi.fn(),
  logout: vi.fn()
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { displayName: "Ciudadano prueba" },
    logout: mocks.logout
  })
}));

vi.mock("../services/api", async () => {
  const actual = await vi.importActual<typeof import("../services/api")>("../services/api");
  return {
    ...actual,
    getCategories: mocks.getCategories,
    createReport: mocks.createReport
  };
});

vi.mock("@capacitor/geolocation", () => ({
  Geolocation: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getCurrentPosition: vi.fn()
  }
}));

vi.mock("@capacitor/camera", () => ({
  Camera: {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getPhoto: vi.fn()
  },
  CameraResultType: { Uri: "uri" },
  CameraSource: { Camera: "camera" }
}));

beforeEach(() => {
  mocks.getCategories.mockResolvedValue([{ id: 1, nombre: "robo" }]);
});

describe("mobile citizen flows", () => {
  test("home renders the main citizen actions", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText("Hola, Ciudadano prueba")).toBeInTheDocument();
    expect(screen.getByText("Nuevo reporte")).toBeInTheDocument();
    expect(screen.getByText("Mis reportes")).toBeInTheDocument();
    expect(screen.getByText("Emergencia")).toBeInTheDocument();
  });

  test("emergency page exposes the four assistance contacts", () => {
    render(<MemoryRouter><EmergencyPage /></MemoryRouter>);
    expect(screen.getByText("Serenazgo")).toBeInTheDocument();
    expect(screen.getByText("Comisaria")).toBeInTheDocument();
    expect(screen.getByText("Bomberos")).toBeInTheDocument();
    expect(screen.getByText("Ambulancia")).toBeInTheDocument();
  });

  test("detail page displays the selected citizen report", () => {
    render(
      <MemoryRouter initialEntries={[{
        pathname: "/detalle",
        state: {
          report: {
            id: 43,
            categoria_id: 1,
            categoria_nombre: "asalto",
            urgencia: "media",
            descripcion: "Reporte desde el movil",
            estado: "pendiente",
            created_at: "2026-07-08T17:00:00.000Z"
          }
        }
      }]}>
        <DetailReportPage />
      </MemoryRouter>
    );
    expect(screen.getByText("asalto")).toBeInTheDocument();
    expect(screen.getByText(/Reporte desde el movil/)).toBeInTheDocument();
  });

  test("new report loads categories and capture actions", async () => {
    render(<MemoryRouter><NewReportPage /></MemoryRouter>);
    expect(await screen.findByText("Robo")).toBeInTheDocument();
    expect(screen.getByText("Capturar ubicacion GPS")).toBeInTheDocument();
    expect(screen.getByText("Capturar fotografia")).toBeInTheDocument();
    expect(screen.getByText("Enviar reporte")).toBeInTheDocument();
  });
});
