# Trazabilidad con tesis

Fuente revisada: `Tesis_4ta.pdf`.

Limite de lectura usado para desarrollo inicial: hasta antes de la seccion `3.4. Pruebas del Sistema`, que inicia en la pagina PDF 90.

## Puntos trazados

- Objetivo general: sistema GIS de reportes ciudadanos para toma de decisiones en seguridad ciudadana.
- Objetivos especificos: captura y gestion de reportes, infraestructura GIS, visualizacion, filtros e indicadores.
- Requisitos funcionales: autenticacion, registro georreferenciado, metadatos, emergencia, dashboard, validacion, mapas de calor, analisis espacial e informes.
- Requisitos no funcionales: usabilidad, rendimiento, compatibilidad, seguridad, privacidad y disponibilidad.
- Arquitectura: tres capas con app movil, dashboard, API REST y PostgreSQL + PostGIS.
- Modelo de datos: usuarios, categorias, zonas, reportes, reporte_fotos, historial_reportes, analisis_kde, indicadores_reportes y vw_reportes_dashboard.
- Flujo principal: ciudadano registra reporte, API valida datos y token, guarda fotografia, registra punto georreferenciado y dashboard consulta para gestion.
- Estados del reporte: pendiente, validado, rechazado, atendido y archivado.

## Ajustes de alcance confirmados

- Ciudadanos: Google Sign-In con Firebase Auth, sin formulario tradicional de correo y password en app movil.
- Dashboard: autenticacion administrativa interna con password hasheado.
- Fotos: storage local controlado, sin guardar binarios en PostgreSQL.
- Analisis estadistico exploratorio: solo en dashboard para gestores y administradores, con interpretaciones en lenguaje simple y sin conclusiones causales.

## Fase 2 - Base de datos

La validacion del esquema toma como referencia el modelo de datos de la tesis y los ajustes de seguridad confirmados:

- `usuarios.password_hash` reemplaza cualquier password en texto plano.
- `usuarios.firebase_uid` permite sincronizar ciudadanos autenticados con Firebase.
- `reporte_fotos.ruta_relativa` almacena referencias al storage local controlado.
- Las geometrias usan SRID 4326.
- El usuario `admin/admin` se considera credencial academica de prototipo, se siembra de forma explicita y se guarda con hash bcrypt.
