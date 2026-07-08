-- Canonical schema summary. Incremental DDL lives in database/migrations.
-- Do not add destructive DDL here without an incremental migration.

-- Extension:
--   postgis

-- Core objects:
--   usuarios(id, firebase_uid, email, nombre, rol, activo, password_hash, created_at, updated_at)
--   categorias(id, nombre, descripcion, activo, created_at, updated_at)
--   zonas(id, nombre, descripcion, geom geometry(Polygon,4326), activo, created_at, updated_at)
--   reportes(id, usuario_id, categoria_id, zona_id, urgencia, descripcion, ubicacion geometry(Point,4326), direccion_aprox, estado, validado_por, validado_at, created_at, updated_at)
--   reporte_fotos(id, reporte_id, ruta_relativa, descripcion, created_at)
--   historial_reportes(id, reporte_id, usuario_id, accion, estado_anterior, estado_nuevo, comentario, created_at)
--   analisis_kde(id, fecha_calculo, periodo_inicio, periodo_fin, categoria_id, zona_id, total_reportes, resultado_json, geom_hull geometry(Polygon,4326))
--   indicadores_reportes(id, fecha, categoria_id, zona_id, total_reportes, total_validados, total_rechazados, total_pendientes, created_at)
--   vw_reportes_dashboard
