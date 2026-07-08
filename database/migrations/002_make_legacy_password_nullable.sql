do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'usuarios'
      and column_name = 'password'
      and is_nullable = 'NO'
  ) then
    alter table usuarios alter column password drop not null;
  end if;
end $$;
