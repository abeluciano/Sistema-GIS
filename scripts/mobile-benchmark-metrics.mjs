function data(size) {
  return Array.from({ length: size }, (_, id) => ({
    id,
    created_at: new Date(2026, 0, (id % 28) + 1).toISOString(),
    latitud: -16.4 - (id * 0.00001),
    longitud: -71.5 - (id * 0.00001),
    valor: id % 5
  }));
}

function measure(name, operation) {
  operation();
  const started = performance.now();
  let value;
  const iterations = 5;
  for (let index = 0; index < iterations; index += 1) value = operation();
  const elapsedMs = Number(((performance.now() - started) / iterations).toFixed(2));
  return { name, elapsedMs, value };
}

const results = [];

for (const size of [1000, 2500, 5000]) {
  const serialized = JSON.stringify(data(size));
  const result = measure(`JSON ${size}`, () => JSON.parse(serialized).length);
  results.push({ scenario: `Deserializacion JSON ${size}`, volume: size, elapsedMs: result.elapsedMs, valid: result.value === size });
}

for (const size of [100, 500, 1000]) {
  const result = measure(`Ordenamiento ${size}`, () => (
    data(size).filter((item) => item.valor >= 2).sort((a, b) => b.created_at.localeCompare(a.created_at))
  ));
  results.push({ scenario: `Filtrado y ordenamiento ${size}`, volume: size, elapsedMs: result.elapsedMs, valid: result.value.length > 0 });
}

for (const size of [1000, 10000]) {
  const values = data(size).map((item) => item.valor);
  const result = measure(`Estadistica ${size}`, () => values.reduce((sum, value) => sum + value, 0) / values.length);
  results.push({ scenario: `Computacion estadistica ${size}`, volume: size, elapsedMs: result.elapsedMs, valid: Number.isFinite(result.value) });
}

const points = measure("GeoJSON puntos", () => ({
  type: "FeatureCollection",
  features: data(1000).map((item) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [item.longitud, item.latitud] }
  }))
}));
results.push({ scenario: "Serializacion GeoJSON puntos", volume: 1000, elapsedMs: points.elapsedMs, valid: points.value.features.length === 1000 });

const polygons = measure("GeoJSON poligonos", () => ({
  type: "MultiPolygon",
  coordinates: Array.from({ length: 250 }, (_, index) => [[
    [-71.5 - index * 0.0001, -16.4],
    [-71.49 - index * 0.0001, -16.4],
    [-71.49 - index * 0.0001, -16.41],
    [-71.5 - index * 0.0001, -16.4]
  ]])
}));
results.push({ scenario: "Serializacion GeoJSON poligonos", volume: 250, elapsedMs: polygons.elapsedMs, valid: polygons.value.coordinates.length === 250 });

console.table(results);
console.log(JSON.stringify({
  total: results.length,
  passed: results.filter((row) => row.valid).length,
  results
}, null, 2));

if (results.some((row) => !row.valid)) process.exit(1);
