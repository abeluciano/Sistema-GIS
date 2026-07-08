import {
  chiSquaredTest,
  kruskalWallisTest,
  mannWhitneyTest,
  spearmanCorrelation
} from "../src/services/statisticsService.js";

describe("statistics service", () => {
  test("chiSquaredTest returns contingency table and p-value", () => {
    const result = chiSquaredTest([
      { variable_a: "Robo", variable_b: "Zona A", total: 10 },
      { variable_a: "Robo", variable_b: "Zona B", total: 2 },
      { variable_a: "Vandalismo", variable_b: "Zona A", total: 3 },
      { variable_a: "Vandalismo", variable_b: "Zona B", total: 9 }
    ]);

    expect(result.canRun).toBe(true);
    expect(result.test).toBe("Chi-cuadrado de independencia");
    expect(result.pValue).toBeGreaterThanOrEqual(0);
    expect(result.contingencyTable.values).toHaveLength(2);
  });

  test("mannWhitneyTest compares two independent groups", () => {
    const result = mannWhitneyTest([
      { label: "Zona A", values: [1, 2, 2, 3] },
      { label: "Zona B", values: [7, 8, 9, 9] }
    ]);

    expect(result.canRun).toBe(true);
    expect(result.test).toBe("U de Mann-Whitney");
    expect(result.sampleSizes).toHaveLength(2);
  });

  test("kruskalWallisTest compares three groups", () => {
    const result = kruskalWallisTest([
      { label: "Zona A", values: [1, 2, 2] },
      { label: "Zona B", values: [5, 6, 7] },
      { label: "Zona C", values: [9, 10, 11] }
    ]);

    expect(result.canRun).toBe(true);
    expect(result.test).toBe("Kruskal-Wallis");
    expect(result.degreesOfFreedom).toBe(2);
  });

  test("spearmanCorrelation returns rho", () => {
    const result = spearmanCorrelation([
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 5 },
      { x: 4, y: 7 },
      { x: 5, y: 11 }
    ]);

    expect(result.canRun).toBe(true);
    expect(result.test).toBe("Correlacion de Spearman");
    expect(result.rho).toBeGreaterThan(0);
  });
});
