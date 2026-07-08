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
  },

  async findByFirebaseUid(firebaseUid) {
    const result = await query(
      "select id, firebase_uid, email, nombre, rol, activo from usuarios where firebase_uid = $1 limit 1",
      [firebaseUid]
    );

    return result.rows[0] ?? null;
  },

  async syncFirebaseUser({ firebaseUid, email, nombre }) {
    const result = await query(
      `
        insert into usuarios (firebase_uid, email, nombre, rol, activo)
        values ($1, $2, $3, 'ciudadano', true)
        on conflict (firebase_uid) do update
        set
          email = excluded.email,
          nombre = excluded.nombre,
          updated_at = now()
        returning id, firebase_uid, email, nombre, rol, activo, created_at, updated_at
      `,
      [firebaseUid, email, nombre]
    );

    return result.rows[0];
  },

  async list({ rol, activo } = {}) {
    const filters = [];
    const values = [];

    if (rol) {
      values.push(rol);
      filters.push(`rol = $${values.length}`);
    }

    if (activo !== undefined) {
      values.push(activo);
      filters.push(`activo = $${values.length}`);
    }

    const where = filters.length > 0 ? `where ${filters.join(" and ")}` : "";
    const result = await query(
      `
        select id, firebase_uid, email, nombre, rol, activo, created_at, updated_at
        from usuarios
        ${where}
        order by created_at desc
        limit 200
      `,
      values
    );

    return result.rows;
  },

  async updateRole(id, rol) {
    const result = await query(
      `
        update usuarios
        set rol = $2, updated_at = now()
        where id = $1
        returning id, firebase_uid, email, nombre, rol, activo, created_at, updated_at
      `,
      [id, rol]
    );

    return result.rows[0] ?? null;
  },

  async updateActive(id, activo) {
    const result = await query(
      `
        update usuarios
        set activo = $2, updated_at = now()
        where id = $1
        returning id, firebase_uid, email, nombre, rol, activo, created_at, updated_at
      `,
      [id, activo]
    );

    return result.rows[0] ?? null;
  }
};
