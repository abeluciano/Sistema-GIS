import { query } from "../config/database.js";

export const userRepository = {
  async findAdminByLogin(login) {
    const result = await query(
      `
        select id, email, nombre, rol, activo, password_hash
        from usuarios
        where email = $1
          and rol in ('gestor', 'administrador')
        limit 1
      `,
      [login]
    );

    return result.rows[0] ?? null;
  },

  async findById(id) {
    const result = await query(
      "select id, email, nombre, rol, activo, firebase_uid from usuarios where id = $1 limit 1",
      [id]
    );

    return result.rows[0] ?? null;
  }
};
