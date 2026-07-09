import "dotenv/config";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
});

await client.connect();

try {
  const summary = await client.query(`
    select
      (select count(*)::int from zonas where activo and geom is not null) as zonas,
      count(*)::int as reportes,
      count(zona_id)::int as reportes_asignados
    from reportes
  `);

  await client.query("begin");
  const inserted = await client.query(`
    insert into reportes (
      usuario_id, categoria_id, urgencia, descripcion, ubicacion, estado
    )
    select
      (select id from usuarios order by id limit 1),
      (select id from categorias where activo order by id limit 1),
      'media',
      'Verificacion transaccional de asignacion espacial',
      st_setsrid(st_makepoint(-71.525, -16.43), 4326),
      'pendiente'
    returning id, zona_id
  `);

  if (!inserted.rows[0]?.zona_id) {
    throw new Error("El trigger no asigno una zona al punto de control.");
  }

  console.log(JSON.stringify({
    ...summary.rows[0],
    trigger: "ok",
    zona_control: inserted.rows[0].zona_id,
    persistencia: "rollback"
  }));
} finally {
  await client.query("rollback").catch(() => undefined);
  await client.end();
}
