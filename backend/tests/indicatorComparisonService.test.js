import { jest } from "@jest/globals";

const queryMock = jest.fn();

jest.unstable_mockModule("../src/config/database.js", () => ({
  query: queryMock
}));

const { comparePeriods } = await import("../src/services/indicatorComparisonService.js");

describe("period comparison service", () => {
  beforeEach(() => queryMock.mockReset());

  test("calculates absolute and percentage changes", async () => {
    queryMock.mockResolvedValue({
      rows: [
        { nombre: "Sector A", periodo_a: 4, periodo_b: 6 },
        { nombre: "Sector B", periodo_a: 0, periodo_b: 2 }
      ]
    });

    const result = await comparePeriods({
      periodo_a_inicio: "2026-05-01",
      periodo_a_fin: "2026-05-31",
      periodo_b_inicio: "2026-06-01",
      periodo_b_fin: "2026-06-30",
      agrupar: "zona"
    });

    expect(result.resumen).toEqual({
      periodo_a: 4,
      periodo_b: 8,
      diferencia: 4,
      variacion_porcentual: 100
    });
    expect(result.data[0].variacion_porcentual).toBe(50);
    expect(result.data[1].variacion_porcentual).toBeNull();
  });

  test("rejects reversed date ranges", async () => {
    await expect(comparePeriods({
      periodo_a_inicio: "2026-06-30",
      periodo_a_fin: "2026-06-01",
      periodo_b_inicio: "2026-07-01",
      periodo_b_fin: "2026-07-31",
      agrupar: "zona"
    })).rejects.toMatchObject({ statusCode: 400 });
    expect(queryMock).not.toHaveBeenCalled();
  });
});
