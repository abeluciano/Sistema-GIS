import { ZodError } from "zod";
import { env } from "../config/env.js";

export function notFoundHandler(req, _res, next) {
  const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Los datos enviados no son validos.",
      details: error.flatten()
    });
  }

  const statusCode = error.statusCode || 500;
  const publicMessage = statusCode >= 500 ? "Ocurrio un error interno." : error.message;

  return res.status(statusCode).json({
    error: error.code || "REQUEST_ERROR",
    message: publicMessage,
    details: error.details ?? (env.NODE_ENV === "production" ? undefined : { message: error.message })
  });
}
