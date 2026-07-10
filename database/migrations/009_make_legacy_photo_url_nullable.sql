do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reporte_fotos'
      and column_name = 'url'
      and is_nullable = 'NO'
  ) then
    alter table reporte_fotos alter column url drop not null;
  end if;
end $$;
