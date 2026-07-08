-- Non-destructive helper queries for Fase 2 schema validation.

select extname
from pg_extension
where extname = 'postgis';

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;

select table_name
from information_schema.views
where table_schema = 'public'
order by table_name;

select f_table_name, f_geometry_column, type, srid
from public.geometry_columns
where f_table_schema = 'public'
order by f_table_name, f_geometry_column;
