const baseUrl = process.env.TEST_API_URL ?? "http://localhost:4000";
const adminUser = process.env.TEST_ADMIN_USER;
const adminPassword = process.env.TEST_ADMIN_PASSWORD;

if (!adminUser || !adminPassword) {
  console.error("TEST_ADMIN_USER and TEST_ADMIN_PASSWORD are required.");
  process.exit(1);
}

const results = [];

async function run(id, name, path, expectedStatus, options = {}) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, options);
  const elapsed = performance.now() - started;
  const passed = response.status === expectedStatus;
  results.push({
    id,
    name,
    expectedStatus,
    actualStatus: response.status,
    elapsedMs: Number(elapsed.toFixed(2)),
    result: passed ? "OK" : "ERROR"
  });
  if (!passed) throw new Error(`${name}: expected ${expectedStatus}, received ${response.status}`);
  return response;
}

await run(1, "GET /health", "/health", 200);
await run(2, "POST /admin/login incompleto", "/admin/login", 400, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ usuario: adminUser })
});
await run(3, "POST /admin/login invalido", "/admin/login", 401, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ usuario: adminUser, password: "credencial-invalida" })
});
const loginResponse = await run(4, "POST /admin/login valido", "/admin/login", 200, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ usuario: adminUser, password: adminPassword })
});
const session = await loginResponse.json();
const authHeaders = { Authorization: `Bearer ${session.token}` };

await run(5, "GET /admin/me sin token", "/admin/me", 401);
await run(6, "GET /admin/me autenticado", "/admin/me", 200, { headers: authHeaders });
await run(7, "GET /reportes paginado", "/reportes?page=1&page_size=5", 200, { headers: authHeaders });
await run(8, "POST /reportes sin Firebase token", "/reportes", 401, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({})
});
await run(9, "PATCH /reportes sin estado", "/reportes/43/estado", 400, {
  method: "PATCH",
  headers: { ...authHeaders, "Content-Type": "application/json" },
  body: JSON.stringify({})
});
await run(10, "GET /reportes ajusta pagina", "/reportes?page=999&page_size=5", 200, { headers: authHeaders });

console.table(results);
console.log(JSON.stringify({ total: results.length, passed: results.filter((row) => row.result === "OK").length, results }, null, 2));
