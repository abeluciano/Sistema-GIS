import "dotenv/config";
import { Client } from "pg";

const expectedTables = {
  usuarios: ["id", "firebase_uid", "email", "nombre", "rol", "activo", "password_hash", "created_at", "updated_at"],
  categorias: ["id", "nombre", "descripcion", "activo", "created_at", "updated_at"],
  zonas: ["id", "nombre", "descripcion", "geom", "activo", "created_at", "updated_at"],
  reportes: ["id", "usuario_id", "categoria_id", "zona_id", "urgencia", "descripcion", "ubicacion", "direccion_aprox", "estado", "validado_por", "validado_at", "created_at", "updated_at"],
  reporte_fotos: ["id", "reporte_id", "descripcion", "created_at"],
  historial_reportes: ["id", "reporte_id", "usuario_id", "accion", "estado_anterior", "estado_nuevo", "comentario", "created_at"],
  analisis_kde: ["id", "fecha_calculo", "periodo_inicio", "periodo_fin", "categoria_id", "zona_id", "total_reportes", "resultado_json", "geom_hull"],
  indicadores_reportes: ["id", "fecha", "categoria_id", "zona_id", "total_reportes", "total_validados", "total_rechazados", "total_pendientes", "created_at"]
};

const expectedViews = ["vw_reportes_dashboard"];

const expectedIndexes = [
  { table: "usuarios", name: "idx_usuarios_firebase_uid" },
  { table: "usuarios", name: "idx_usuarios_email" },
  { table: "reportes", name: "idx_reportes_ubicacion" },
  { table: "reportes", name: "idx_reportes_estado" },
  { table: "reportes", name: "idx_reportes_categoria_id" },
  { table: "reportes", name: "idx_reportes_zona_id" },
  { table: "zonas", name: "idx_zonas_geom" },
  { table: "historial_reportes", name: "idx_historial_reportes_reporte_id" },
  { table: "reporte_fotos", name: "idx_reporte_fotos_reporte_id" },
  { table: "indicadores_reportes", name: "idx_indicadores_reportes_fecha" }
];

const expectedForeignKeys = [
  { table: "reportes", column: "usuario_id", target: "usuarios" },
  { table: "reportes", column: "categoria_id", target: "categorias" },
  { table: "reportes", column: "zona_id", target: "zonas" },
  { table: "reportes", column: "validado_por", target: "usuarios" },
  { table: "reporte_fotos", column: "reporte_id", target: "reportes" },
  { table: "historial_reportes", column: "reporte_id", target: "reportes" },
  { table: "historial_reportes", column: "usuario_id", target: "usuarios" },
  { table: "analisis_kde", column: "categoria_id", target: "categorias" },
  { table: "analisis_kde", column: "zona_id", target: "zonas" },
  { table: "indicadores_reportes", column: "categoria_id", target: "categorias" },
  { table: "indicadores_reportes", column: "zona_id", target: "zonas" }
];

const geometryExpectations = [
  { table: "zonas", column: "geom", type: "POLYGON", srid: 4326 },
  { table: "reportes", column: "ubicacion", type: "POINT", srid: 4326 },
  { table: "analisis_kde", column: "geom_hull", type: "POLYGON", srid: 4326 }
];

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Copy backend/.env.example to backend/.env or export it locally.");
  process.exit(1);
}

function groupByTable(columns) {
  const grouped = new Map();
  for (const column of columns) {
    if (!grouped.has(column.table_name)) grouped.set(column.table_name, new Set());
    grouped.get(column.table_name).add(column.column_name);
  }
  return grouped;
}

function printList(title, values) {
  console.log(`\n${title}`);
  if (values.length === 0) {
    console.log("- none");
    return;
  }
  for (const value of values) console.log(`- ${value}`);
}

function hasPhotoPath(columnsByTable) {
  const columns = columnsByTable.get("reporte_fotos") ?? new Set();
  return columns.has("ruta_relativa") || columns.has("url");
}

function recommendationsFor(results) {
  const recommendations = [];
  if (!results.postgis) recommendations.push("Enable PostGIS before creating geometry columns.");
  if (results.missingTables.length > 0) recommendations.push("Apply incremental migrations for missing tables.");
  if (results.missingColumns.length > 0) recommendations.push("Add missing columns with ALTER TABLE ... ADD COLUMN IF NOT EXISTS.");
  if (results.missingPhotoPath) recommendations.push("Add reporte_fotos.ruta_relativa or reporte_fotos.url for local evidence references.");
  if (results.missingViews.length > 0) recommendations.push("Create or replace vw_reportes_dashboard for dashboard reads.");
  if (results.missingIndexes.length > 0) recommendations.push("Create missing btree/GiST indexes for dashboard filters and GIS queries.");
  if (results.missingForeignKeys.length > 0) recommendations.push("Add missing foreign keys after checking existing data consistency.");
  if (results.geometryIssues.length > 0) recommendations.push("Validate geometry types and SRID 4326 before using GIS endpoints.");
  if (!results.adminExists) recommendations.push("Seed prototype admin user with a bcrypt password hash and change it before production.");
  return recommendations;
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
});

await client.connect();

try {
  const postgisResult = await client.query("select exists(select 1 from pg_extension where extname = 'postgis') as enabled");
  const postgis = Boolean(postgisResult.rows[0]?.enabled);

  const tablesResult = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
    order by table_name
  `);

  const viewsResult = await client.query(`
    select table_name
    from information_schema.views
    where table_schema = 'public'
    order by table_name
  `);

  const columnsResult = await client.query(`
    select table_name, column_name, data_type, udt_name, is_nullable
    from information_schema.columns
    where table_schema = 'public'
    order by table_name, ordinal_position
  `);

  const indexesResult = await client.query(`
    select tablename as table_name, indexname as index_name
    from pg_indexes
    where schemaname = 'public'
    order by tablename, indexname
  `);

  const foreignKeysResult = await client.query(`
    select tc.table_name, kcu.column_name, ccu.table_name as foreign_table_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
     and tc.table_schema = kcu.table_schema
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name
     and ccu.table_schema = tc.table_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
    order by tc.table_name, kcu.column_name
  `);

  let geometryRows = [];
  if (postgis) {
    const geometryResult = await client.query(`
      select f_table_name as table_name, f_geometry_column as column_name, type, srid
      from public.geometry_columns
      where f_table_schema = 'public'
      order by f_table_name, f_geometry_column
    `);
    geometryRows = geometryResult.rows;
  }

  const foundTables = tablesResult.rows.map((row) => row.table_name);
  const foundViews = viewsResult.rows.map((row) => row.table_name);
  const columnsByTable = groupByTable(columnsResult.rows);
  const foundIndexes = new Set(indexesResult.rows.map((row) => row.index_name));
  const foundForeignKeys = foreignKeysResult.rows;

  let adminExists = false;
  if (foundTables.includes("usuarios") && columnsByTable.get("usuarios")?.has("password_hash")) {
    const adminResult = await client.query(`
      select exists(
        select 1
        from usuarios
        where email = 'admin'
          and rol = 'administrador'
          and password_hash is not null
      ) as exists
    `);
    adminExists = Boolean(adminResult.rows[0]?.exists);
  }

  const missingTables = Object.keys(expectedTables).filter((table) => !foundTables.includes(table));
  const missingColumns = [];
  for (const [table, columns] of Object.entries(expectedTables)) {
    const foundColumns = columnsByTable.get(table) ?? new Set();
    for (const column of columns) {
      if (!foundColumns.has(column)) missingColumns.push(`${table}.${column}`);
    }
  }

  const missingPhotoPath = foundTables.includes("reporte_fotos") && !hasPhotoPath(columnsByTable);
  const missingViews = expectedViews.filter((view) => !foundViews.includes(view));
  const missingIndexes = expectedIndexes
    .filter((index) => !foundIndexes.has(index.name))
    .map((index) => `${index.table}.${index.name}`);

  const missingForeignKeys = expectedForeignKeys
    .filter((expected) => !foundForeignKeys.some((found) => (
      found.table_name === expected.table
      && found.column_name === expected.column
      && found.foreign_table_name === expected.target
    )))
    .map((expected) => `${expected.table}.${expected.column} -> ${expected.target}`);

  const geometryIssues = geometryExpectations
    .filter((expected) => {
      const found = geometryRows.find((row) => row.table_name === expected.table && row.column_name === expected.column);
      if (!found) return true;
      return String(found.type).toUpperCase() !== expected.type || Number(found.srid) !== expected.srid;
    })
    .map((expected) => `${expected.table}.${expected.column} should be geometry(${expected.type},${expected.srid})`);

  const results = {
    postgis,
    missingTables,
    missingColumns,
    missingPhotoPath,
    missingViews,
    missingIndexes,
    missingForeignKeys,
    geometryIssues,
    adminExists
  };

  console.log("DATABASE SCHEMA CHECK");
  console.log("=====================");
  console.log(`PostGIS enabled: ${postgis ? "yes" : "no"}`);
  console.log(`Prototype admin user present: ${adminExists ? "yes" : "no"}`);

  printList("Tables found", foundTables);
  printList("Views found", foundViews);
  printList("Missing tables", missingTables);
  printList("Missing columns", missingColumns);
  printList("Missing indexes", missingIndexes);
  printList("Missing foreign keys", missingForeignKeys);
  printList("Geometry issues", geometryIssues);

  if (missingPhotoPath) printList("Photo path issue", ["reporte_fotos requires either ruta_relativa or url"]);
  printList("Recommendations", recommendationsFor(results));

  const hasFindings = missingTables.length > 0
    || missingColumns.length > 0
    || missingPhotoPath
    || missingViews.length > 0
    || missingIndexes.length > 0
    || missingForeignKeys.length > 0
    || geometryIssues.length > 0
    || !postgis
    || !adminExists;

  process.exitCode = hasFindings ? 2 : 0;
} finally {
  await client.end();
}
