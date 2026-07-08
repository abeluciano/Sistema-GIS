do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reportes'
      and column_name = 'categoria'
      and is_nullable = 'NO'
  ) then
    alter table reportes alter column categoria drop not null;
  end if;
end $$;
