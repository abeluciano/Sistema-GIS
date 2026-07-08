const targets = (process.env.LOAD_TARGET_URLS ?? process.env.LOAD_TARGET_URL ?? "http://localhost:4000/health")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const totalRequests = Number(process.env.LOAD_REQUESTS ?? 50);
const concurrency = Number(process.env.LOAD_CONCURRENCY ?? 5);
const method = process.env.LOAD_METHOD ?? "GET";
const authorization = process.env.LOAD_AUTH_TOKEN ? `Bearer ${process.env.LOAD_AUTH_TOKEN}` : undefined;
const requestBody = process.env.LOAD_BODY || undefined;

let completed = 0;
let failed = 0;
let scheduled = 0;
const durations = [];

async function hit(target) {
  const start = performance.now();
  try {
    const response = await fetch(target, {
      method,
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
        ...(requestBody ? { "Content-Type": "application/json" } : {})
      },
      body: requestBody
    });
    if (!response.ok) failed += 1;
  } catch {
    failed += 1;
  } finally {
    durations.push(performance.now() - start);
    completed += 1;
  }
}

async function worker() {
  while (scheduled < totalRequests) {
    const requestIndex = scheduled;
    scheduled += 1;
    await hit(targets[requestIndex % targets.length]);
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const sorted = [...durations].sort((a, b) => a - b);
const p95 = sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] ?? 0;
const avg = sorted.reduce((sum, value) => sum + value, 0) / (sorted.length || 1);

console.log(JSON.stringify({
  targets,
  method,
  totalRequests,
  concurrency,
  completed: durations.length,
  failed,
  avgMs: Number(avg.toFixed(2)),
  p95Ms: Number(p95.toFixed(2))
}, null, 2));

if (failed > 0) {
  console.error("Load smoke detected failed requests. Verify the target server is running.");
  process.exit(1);
}
