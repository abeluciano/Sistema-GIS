import { HttpError } from "../utils/httpError.js";
import { resolveFirebaseAuth } from "../config/firebase.js";

function readBearerToken(req) {
  const header = req.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export async function authenticateFirebase(req, _res, next) {
  const token = readBearerToken(req);
  if (!token) return next(new HttpError(401, "Token Firebase requerido."));

  const firebaseAuth = req.app.locals.firebaseAuth ?? await resolveFirebaseAuth();
  if (!firebaseAuth) {
    return next(new HttpError(503, "Firebase Auth no esta configurado en el backend."));
  }

  try {
    req.firebaseUser = await firebaseAuth.verifyIdToken(token);
    return next();
  } catch {
    return next(new HttpError(401, "Token Firebase invalido."));
  }
}
