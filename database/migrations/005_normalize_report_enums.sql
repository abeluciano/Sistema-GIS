alter table reportes drop constraint if exists reportes_urgencia_check;
alter table reportes drop constraint if exists reportes_estado_check;

update reportes
set urgencia = case urgencia
  when 'bajo' then 'baja'
  when 'medio' then 'media'
  when 'alto' then 'alta'
  else urgencia
end
where urgencia in ('bajo', 'medio', 'alto');

update reportes
set estado = case estado
  when 'en_atencion' then 'validado'
  when 'resuelto' then 'atendido'
  else estado
end
where estado in ('en_atencion', 'resuelto');

alter table reportes
  add constraint reportes_urgencia_check
  check (urgencia in ('baja', 'media', 'alta', 'critica')) not valid;
alter table reportes validate constraint reportes_urgencia_check;

alter table reportes
  add constraint reportes_estado_check
  check (estado in ('pendiente', 'validado', 'rechazado', 'atendido', 'archivado')) not valid;
alter table reportes validate constraint reportes_estado_check;
