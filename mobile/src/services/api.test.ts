import type { User } from "firebase/auth";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createReport, getCategories, getMyReports } from "./api";

const user = {
  getIdToken: vi.fn().mockResolvedValue("firebase-token")
} as unknown as User;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("mobile API service", () => {
  test("filters inactive categories", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [
        { id: 1, nombre: "robo", activo: true },
        { id: 2, nombre: "inactiva", activo: false }
      ]
    }), { status: 200 })));

    await expect(getCategories()).resolves.toEqual([{ id: 1, nombre: "robo", activo: true }]);
  });

  test("creates a georeferenced report with Firebase authorization", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { id: 43, estado: "pendiente" }
    }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const payload = {
      categoria_id: 1,
      urgencia: "media" as const,
      descripcion: "Reporte ciudadano valido",
      latitud: -16.4,
      longitud: -71.5
    };
    await createReport(user, payload);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/reportes"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer firebase-token" }),
        body: JSON.stringify(payload)
      })
    );
  });

  test("loads only reports owned by the authenticated citizen", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [{ id: 43, descripcion: "Reporte", estado: "pendiente" }]
    }), { status: 200 })));

    const reports = await getMyReports(user);
    expect(reports).toHaveLength(1);
    expect(reports[0].id).toBe(43);
  });
});
