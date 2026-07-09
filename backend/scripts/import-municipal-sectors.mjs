import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const applyChanges = process.argv.includes("--apply");
const geojsonPath = resolve(process.cwd(), "..", "database", "data", "sectores-contingencia-2019.geojson");
const collection = JSON.parse(readFileSync(geojsonPath, "utf8"));

if (collection.type !== "FeatureCollection" || collection.features?.length !== 7) {
  throw new Error("Expected a GeoJSON FeatureCollection with seven sectors.");
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
});

await client.connect();
await client.query("begin");

try {
  const existing = await client.query(`
    select count(*)::int as total
    from zonas
    where tipo = 'sector_municipal_referencial'
  `);
  if (applyChanges && existing.rows[0].total > 0) {
    throw new Error("Municipal reference sectors are already imported.");
  }

  await client.query(`
    create temporary table sectores_importados (
      codigo varchar(1) primary key,
      nombre text not null,
      geom geometry(MultiPolygon, 4326) not null
    ) on commit drop
  `);

  for (const feature of collection.features) {
    await client.query(`
      insert into sectores_importados (codigo, nombre, geom)
      select
        $1,
        $2,
        st_multi(st_collectionextract(st_makevalid(st_intersection(
          (select st_unaryunion(st_collect(geom)) from zonas where tipo = 'analitica'),
          st_setsrid(st_geomfromgeojson($3), 4326)
        )), 3))
    `, [
      feature.properties.codigo,
      feature.properties.nombre,
      JSON.stringify(feature.geometry)
    ]);
  }

  await client.query(`
    create temporary table sectores_sin_solape
    on commit drop
    as
    select
      s.codigo,
      s.nombre,
      st_multi(st_collectionextract(st_difference(
        s.geom,
        coalesce(
          (select st_unaryunion(st_collect(previous.geom))
           from sectores_importados previous
           where previous.codigo < s.codigo),
          st_geomfromtext('MULTIPOLYGON EMPTY', 4326)
        )
      ), 3)) as geom
    from sectores_importados s
  `);

  await client.query(`
    create temporary table sectores_normalizados
    on commit drop
    as
    with district as (
      select st_unaryunion(st_collect(geom)) as geom
      from zonas
      where tipo = 'analitica'
    ),
    sector_union as (
      select st_unaryunion(st_collect(geom)) as geom
      from sectores_sin_solape
    ),
    gaps as (
      select (st_dump(st_collectionextract(st_difference(d.geom, s.geom), 3))).geom as geom
      from district d
      cross join sector_union s
    ),
    assigned_gaps as (
      select
        (
          select b.codigo
          from sectores_sin_solape b
          order by st_distance(
            st_pointonsurface(g.geom)::geography,
            b.geom::geography
          ), b.codigo
          limit 1
        ) as codigo,
        g.geom
      from gaps g
    ),
    pieces as (
      select codigo, nombre, geom from sectores_sin_solape
      union all
      select a.codigo, b.nombre, a.geom
      from assigned_gaps a
      join sectores_sin_solape b on b.codigo = a.codigo
    )
    select
      codigo,
      max(nombre) as nombre,
      st_multi(st_collectionextract(st_unaryunion(st_collect(geom)), 3)) as geom
    from pieces
    group by codigo
  `);

  const metrics = await client.query(`
    with district as (
      select st_unaryunion(st_collect(geom)) as geom
      from zonas
      where tipo = 'analitica'
    ),
    sector_stats as (
      select
        st_unaryunion(st_collect(geom)) as union_geom,
        sum(st_area(geom::geography)) as summed_area
      from sectores_normalizados
    )
    select
      round(st_area(d.geom::geography)::numeric, 2) as district_area_m2,
      round(st_area(s.union_geom::geography)::numeric, 2) as covered_area_m2,
      round((st_area(d.geom::geography) - st_area(s.union_geom::geography))::numeric, 2) as gap_area_m2,
      round((s.summed_area - st_area(s.union_geom::geography))::numeric, 2) as overlap_area_m2,
      round((100 * st_area(s.union_geom::geography) / st_area(d.geom::geography))::numeric, 2) as coverage_percent
    from district d
    cross join sector_stats s
  `);

  if (applyChanges) {
    await client.query("update zonas set activo = false where tipo = 'analitica'");
    await client.query(`
      insert into zonas (nombre, descripcion, geom, tipo, fuente, referencia)
      select
        codigo || ' - ' || nombre,
        'Sector referencial digitalizado del mapa municipal de contingencia por sismos. La geometria no tiene precision catastral.',
        geom,
        'sector_municipal_referencial',
        'GDU - MDJLBYR, 2019',
        'Plan de Contingencia por Sismos, paginas 54-55'
      from sectores_normalizados
      order by codigo
    `);

    await client.query(`
      with asignaciones as (
        select r.id as reporte_id, coincidencia.id as zona_id
        from reportes r
        cross join lateral (
          select z.id
          from zonas z
          where z.activo
            and z.geom is not null
            and st_covers(z.geom, r.ubicacion)
          order by st_area(z.geom::geography) asc, z.id asc
          limit 1
        ) coincidencia
      )
      update reportes r
      set zona_id = a.zona_id,
          updated_at = now()
      from asignaciones a
      where r.id = a.reporte_id
        and r.zona_id is distinct from a.zona_id
    `);
  }

  console.log(JSON.stringify({
    mode: applyChanges ? "apply" : "dry-run",
    sectors: collection.features.length,
    ...metrics.rows[0]
  }));

  if (applyChanges) await client.query("commit");
  else await client.query("rollback");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
