export function getHealth(_req, res) {
  res.json({
    status: "ok",
    service: "sistema-gis-backend",
    timestamp: new Date().toISOString()
  });
}
