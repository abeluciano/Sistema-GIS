import { randomUUID } from "node:crypto";

export function requestContext(req, res, next) {
  req.id = req.headers["x-request-id"]?.toString() || randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}
