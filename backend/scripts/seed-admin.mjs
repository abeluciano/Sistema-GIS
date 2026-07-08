import "dotenv/config";
import bcrypt from "bcryptjs";
import { Client } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Copy backend/.env.example to backend/.env or export it locally.");
  process.exit(1);
}

const email = process.env.ADMIN_BOOTSTRAP_USER ?? "admin";
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const name = process.env.ADMIN_BOOTSTRAP_NAME ?? "Administrador prototipo";

if (!password) {
  console.error("ADMIN_BOOTSTRAP_PASSWORD is required to seed the prototype admin user.");
  process.exit(1);
}

const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
const passwordHash = await bcrypt.hash(password, rounds);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
});

await client.connect();

try {
  await client.query(
    `
      insert into usuarios (email, nombre, rol, activo, password_hash)
      values ($1, $2, 'administrador', true, $3)
      on conflict (email) do update
      set
        nombre = excluded.nombre,
        rol = 'administrador',
        activo = true,
        password_hash = excluded.password_hash,
        updated_at = now()
    `,
    [email, name, passwordHash]
  );

  console.log(`Prototype admin user ensured for login: ${email}`);
  console.log("Change this credential before production or public demos.");
} finally {
  await client.end();
}
