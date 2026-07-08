import { HttpError } from "../utils/httpError.js";

export function requireRole(...roles) {
  return (req, _res, next) => {
    const role = req.admin?.rol ?? req.user?.rol;
    if (!role || !roles.includes(role)) {
      return next(new HttpError(403, "No tienes permisos para realizar esta accion."));
    }

    return next();
  };
}
