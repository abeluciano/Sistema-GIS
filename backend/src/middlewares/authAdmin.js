import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

function readToken(req) {
  const header = req.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.admin_token;
}

export function authenticateAdmin(req, _res, next) {
  const token = readToken(req);
  if (!token) return next(new HttpError(401, "Sesion administrativa requerida."));

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.admin = {
      id: payload.sub,
      email: payload.email,
      nombre: payload.nombre,
      rol: payload.rol
    };
    return next();
  } catch {
    return next(new HttpError(401, "Sesion administrativa invalida o expirada."));
  }
}
