# Reporte de Fase 4 - Modulos backend

## Entregables

- Sincronizacion ciudadana con Firebase:
  - `POST /auth/firebase/sync`
  - `GET /me`
- Usuarios administrativos:
  - `GET /usuarios`
  - `GET /usuarios/:id`
  - `PATCH /usuarios/:id/rol`
  - `PATCH /usuarios/:id/estado`
- Categorias y zonas:
  - CRUD base y activacion/desactivacion.
- Reportes:
  - creacion ciudadana con `geometry(Point,4326)`;
  - consulta administrativa con filtros;
  - consulta de mis reportes;
  - transiciones `validado`, `rechazado`, `atendido`, `archivado`;
  - historial de acciones.
- Fotos:
  - subida local controlada;
  - tipos permitidos: `jpg`, `jpeg`, `png`, `webp`;
  - limite de 3 fotografias por reporte.
- Indicadores:
  - resumen;
  - por categoria;
  - por zona;
  - por periodo.
- GIS:
  - reportes GeoJSON;
  - zonas GeoJSON;
  - heatmap basico;
  - registro inicial de analisis KDE exploratorio.
- Exportacion CSV:
  - `GET /export/reportes.csv`.
- Analisis estadistico exploratorio para dashboard:
  - Chi-cuadrado;
  - Mann-Whitney U;
  - Kruskal-Wallis;
  - Spearman;
  - Wilcoxon y Friedman preparados como endpoints documentados para fases posteriores.

## Validaciones ejecutadas

- `npm test -w backend`: 11 tests correctos.
- `npm run check:structure`: correcto.
- Busqueda de patrones sensibles conocidos: pendiente de validacion final de fase.

## Observaciones

- El analisis estadistico esta restringido a dashboard mediante JWT administrativo y roles `gestor`/`administrador`.
- La app movil no consume endpoints estadisticos.
- Las pruebas estadisticas devuelven interpretacion simple y advertencia de no causalidad.
- El MVP GIS queda soportado por GeoJSON, filtros, agregaciones e indicadores, dejando preparada la evolucion hacia mapas de calor, Moran's I y Getis-Ord Gi*.
