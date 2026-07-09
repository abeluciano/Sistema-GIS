alter table zonas
alter column geom type geometry(MultiPolygon, 4326)
using case when geom is null then null else st_multi(geom) end;

comment on column zonas.geom is
'Poligono o multipoligono territorial SRID 4326. La fuente y precision se registran en la misma fila.';
