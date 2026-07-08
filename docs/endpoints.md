# Endpoints

La documentacion formal se expone con Scalar/OpenAPI en:

- `GET /docs`
- `GET /openapi.json`

## Salud

- `GET /health`
- `GET /openapi.json`
- `GET /docs`

## Autenticacion ciudadana y perfil

- `POST /auth/firebase/sync`
- `GET /me`
- `PUT /me`

## Autenticacion dashboard

- `POST /admin/login`
- `GET /admin/me`
- `POST /admin/logout`

## Verificacion Firebase base

- `GET /auth/firebase/profile`

## Gestion

- `GET /usuarios`
- `GET /usuarios/:id`
- `PATCH /usuarios/:id/rol`
- `PATCH /usuarios/:id/estado`
- `GET /categorias`
- `POST /categorias`
- `PUT /categorias/:id`
- `PATCH /categorias/:id/estado`
- `GET /zonas`
- `POST /zonas`
- `PUT /zonas/:id`
- `PATCH /zonas/:id/estado`

## Reportes y fotos

- `GET /reportes`
- `GET /reportes/:id`
- `POST /reportes`
- `GET /mis-reportes`
- `PATCH /reportes/:id/estado`
- `PATCH /reportes/:id/validar`
- `PATCH /reportes/:id/rechazar`
- `PATCH /reportes/:id/atender`
- `PATCH /reportes/:id/archivar`
- `POST /reportes/:id/fotos`
- `GET /reportes/:id/fotos`
- `DELETE /reportes/:id/fotos/:fotoId`
- `GET /reportes/:id/historial`

## Indicadores, GIS y estadistica

- `GET /indicadores/resumen`
- `GET /indicadores/por-categoria`
- `GET /indicadores/por-zona`
- `GET /indicadores/por-periodo`
- `GET /gis/reportes.geojson`
- `GET /gis/zonas.geojson`
- `GET /gis/heatmap`
- `POST /gis/analisis/kde`
- `GET /analisis/estadistico/chi-cuadrado`
- `GET /analisis/estadistico/mann-whitney`
- `GET /analisis/estadistico/kruskal-wallis`
- `GET /analisis/estadistico/spearman`
- `GET /analisis/estadistico/wilcoxon`
- `GET /analisis/estadistico/friedman`

Estos endpoints son solo para dashboard administrativo. La interfaz debe presentarlos como preguntas comprensibles para gestores; los nombres tecnicos quedan como detalle metodologico.

## Exportacion y docs

- `GET /export/reportes.csv`
- `GET /docs`
- `GET /openapi.json`

## Roles

- Ciudadano: `POST /reportes`, `GET /mis-reportes`, `POST /reportes/:id/fotos`, `POST /auth/firebase/sync`, `GET /me`.
- Gestor o administrador: reportes administrativos, GIS, indicadores, estadistica, usuarios, catalogos y exportaciones.
