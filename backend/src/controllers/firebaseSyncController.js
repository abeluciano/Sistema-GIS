import { HttpError } from "../utils/httpError.js";

export async function syncFirebaseUser(req, res) {
  const firebaseUser = req.firebaseUser;
  const email = firebaseUser.email;

  if (!email) {
    throw new HttpError(400, "La cuenta Firebase no tiene email verificable.");
  }

  const user = await req.app.locals.repositories.user.syncFirebaseUser({
    firebaseUid: firebaseUser.uid,
    email,
    nombre: firebaseUser.name ?? email
  });

  res.status(201).json({ user });
}

export async function me(req, res) {
  const user = await req.app.locals.repositories.user.findByFirebaseUid(req.firebaseUser.uid);
  if (!user) throw new HttpError(404, "Perfil ciudadano no sincronizado.");
  res.json({ user });
}
