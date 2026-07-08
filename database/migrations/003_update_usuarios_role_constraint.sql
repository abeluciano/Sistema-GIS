do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'usuarios_rol_check'
  ) then
    alter table usuarios drop constraint usuarios_rol_check;
  end if;

  alter table usuarios
    add constraint usuarios_rol_check
    check (rol in ('ciudadano', 'gestor', 'administrador')) not valid;
end $$;
