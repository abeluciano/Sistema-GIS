# Reporte de Fase 2 - Validacion de base de datos Neon

## Entregables

- Script `npm run db:check -w backend` para inspeccionar PostGIS, tablas, columnas, indices, llaves foraneas, geometria, vista y usuario admin de prototipo.
- Script `npm run db:migrate -w backend` para aplicar migraciones SQL incrementales.
- Migracion `database/migrations/001_initial_schema.sql` con cambios no destructivos.
- Script `npm run db:seed:admin -w backend` para crear el administrador de prototipo de forma explicita.
- Documentacion actualizada en `docs/pruebas.md`, `docs/despliegue.md` y `docs/trazabilidad-tesis.md`.

## Resultado de validacion inicial

- PostGIS: activo.
- Tablas esperadas: presentes.
- Vista `vw_reportes_dashboard`: presente.
- Geometrias SRID 4326: correctas.
- Faltantes encontrados:
  - `usuarios.firebase_uid`.
  - `usuarios.password_hash`.
  - indices `idx_usuarios_firebase_uid`, `idx_usuarios_email`, `idx_indicadores_reportes_fecha`.
  - usuario administrador de prototipo.

## Migracion aplicada

- Se agregaron columnas faltantes.
- Se agregaron indices faltantes.
- Se conservaron datos existentes.
- Las restricciones nuevas se agregaron como `NOT VALID` cuando podian entrar en conflicto con datos historicos.
- Se ajusto la vista para respetar el tipo existente de `total_fotos`.

## Resultado de revalidacion

- PostGIS: activo.
- Tablas: correctas.
- Columnas: correctas.
- Indices: correctos.
- Llaves foraneas: correctas.
- Geometrias: correctas.
- Vista: correcta.
- Pendiente: sembrar el usuario administrador de prototipo con `npm run db:seed:admin -w backend`.

## Nota de seguridad

El seed de `admin/admin` no se ejecuta automaticamente porque crea una cuenta privilegiada predecible. El script queda preparado para ambiente academico/prototipo y debe ejecutarse solo de forma consciente. En produccion o demos publicas se debe cambiar la credencial.
