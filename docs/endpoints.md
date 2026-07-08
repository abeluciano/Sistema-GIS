# Endpoints previstos

La documentacion formal se expondra con Scalar/OpenAPI en fases posteriores.

## Salud

- `GET /health`

## Autenticacion ciudadana y perfil

- `POST /auth/firebase/sync`
- `GET /me`
- `PUT /me`

## Autenticacion dashboard

- `POST /admin/login`
- `GET /admin/me`
- `POST /admin/logout`

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

## Exportacion y docs

- `GET /export/reportes.csv`
- `GET /docs`
- `GET /openapi.json`
