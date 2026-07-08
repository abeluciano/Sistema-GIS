import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export async function loginAdmin({ usuario, password }, repositories) {
  const admin = await repositories.user.findAdminByLogin(usuario);

  if (!admin || !admin.activo || !admin.password_hash) {
    throw new HttpError(401, "Credenciales administrativas invalidas.");
  }

  const passwordMatches = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatches) {
    throw new HttpError(401, "Credenciales administrativas invalidas.");
  }

  const user = {
    id: admin.id,
    email: admin.email,
    nombre: admin.nombre,
    rol: admin.rol
  };

  const token = jwt.sign(
    {
      sub: String(admin.id),
      email: admin.email,
      nombre: admin.nombre,
      rol: admin.rol
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "8h" }
  );

  return { token, user };
}
