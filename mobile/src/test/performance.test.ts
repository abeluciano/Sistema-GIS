import { describe, expect, test } from "vitest";

type Point = { id: number; created_at: string; latitud: number; longitud: number; valor: number };

function data(size: number): Point[] {
  return Array.from({ length: size }, (_, id) => ({
    id,
    created_at: new Date(2026, 0, (id % 28) + 1).toISOString(),
    latitud: -16.4 - (id * 0.00001),
    longitud: -71.5 - (id * 0.00001),
    valor: id % 5
  }));
}

function timed<T>(label: string, operation: () => T, limitMs: number) {
  const started = performance.now();
  const value = operation();
  const elapsed = performance.now() - started;
  console.log(`[METRIC] ${label}: ${elapsed.toFixed(2)} ms`);
  expect(elapsed).toBeLessThan(limitMs);
  return value;
}

describe("mobile performance benchmarks", () => {
  for (const size of [1000, 2500, 5000]) {
    test(`parses ${size} JSON reports`, () => {
      const serialized = JSON.stringify(data(size));
      const parsed = timed(`JSON ${size}`, () => JSON.parse(serialized), 250);
      expect(parsed).toHaveLength(size);
    });
  }

  for (const size of [100, 500, 1000]) {
    test(`filters and sorts ${size} reports`, () => {
      const sorted = timed(
        `Filter/sort ${size}`,
        () => data(size).filter((item) => item.valor >= 2).sort((a, b) => b.created_at.localeCompare(a.created_at)),
        200
      );
      expect(sorted.length).toBeGreaterThan(0);
    });
  }

  test("computes statistics for a standard block", () => {
    const values = data(1000).map((item) => item.valor);
    const average = timed("Statistics 1000", () => values.reduce((sum, value) => sum + value, 0) / values.length, 100);
    expect(average).toBeGreaterThanOrEqual(0);
  });

  test("computes statistics for a massive block", () => {
    const values = data(10000).map((item) => item.valor);
    const average = timed("Statistics 10000", () => values.reduce((sum, value) => sum + value, 0) / values.length, 150);
    expect(average).toBeGreaterThanOrEqual(0);
  });

  test("serializes geographic coordinates to GeoJSON", () => {
    const geojson = timed("GeoJSON points", () => ({
      type: "FeatureCollection",
      features: data(1000).map((item) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [item.longitud, item.latitud] }
      }))
    }), 150);
    expect(geojson.features).toHaveLength(1000);
  });

  test("serializes complex spatial polygons", () => {
    const geojson = timed("GeoJSON polygons", () => ({
      type: "MultiPolygon",
      coordinates: Array.from({ length: 250 }, (_, index) => [[
        [-71.5 - index * 0.0001, -16.4],
        [-71.49 - index * 0.0001, -16.4],
        [-71.49 - index * 0.0001, -16.41],
        [-71.5 - index * 0.0001, -16.4]
      ]])
    }), 150);
    expect(geojson.coordinates).toHaveLength(250);
  });
});
