const target = process.env.LOAD_TARGET_URL ?? "http://localhost:4000/health";
const totalRequests = Number(process.env.LOAD_REQUESTS ?? 50);
const concurrency = Number(process.env.LOAD_CONCURRENCY ?? 5);

let completed = 0;
let failed = 0;
let scheduled = 0;
const durations = [];

async function hit() {
  const start = performance.now();
  try {
    const response = await fetch(target);
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
    scheduled += 1;
    await hit();
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const sorted = [...durations].sort((a, b) => a - b);
const p95 = sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)] ?? 0;
const avg = sorted.reduce((sum, value) => sum + value, 0) / (sorted.length || 1);

console.log(JSON.stringify({
  target,
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
