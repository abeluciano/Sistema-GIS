# Fase 18 - Indicadores, filtros y cierre de objetivos

## Alcance

Esta fase integra los filtros de estado, categoria, zona, urgencia y periodo en
reportes, KPI, graficos, GeoJSON, mapa de calor y concentracion territorial.
Tambien completa la experiencia del analisis estadistico para gestores.

## Cambios realizados

- Los KPI y graficos ya no muestran totales globales cuando existen filtros.
- Los indicadores por categoria, zona y periodo usan los mismos criterios.
- El analisis estadistico permite filtrar por fecha, zona, categoria y estado.
- Las comparaciones entre dos grupos usan listas de zonas o categorias existentes,
  no campos de texto ni nombres tecnicos de pruebas.
- Mann-Whitney, Kruskal-Wallis y Spearman reciben los filtros seleccionados.
- Chi-cuadrado conserva sus variables categoricas y recibe los mismos filtros.
- Wilcoxon y Friedman permanecen documentadas como no ejecutables mientras no
  existan datos pareados suficientes.

## 1. Evidencia de los resultados

| Evidencia | Resultado |
|---|---|
| Backend Jest | 15/15 |
| Aplicacion movil Vitest | 18/18 |
| Dashboard Vitest | 11/11 |
| Total automatizado | 44/44 |
| Build movil | Correcto |
| Build dashboard | Correcto |
| API `/health` | Operativa |
| Total real sin filtro | 14 reportes |
| Total real con estado `validado` | 8 reportes |
| Periodos con reportes validados | 3 |
| Categorias con reportes validados | 4 |
| Chi-cuadrado filtrado por `validado` | Ejecutado |
| Zonas PostGIS | 6 |
| Reportes asignados espacialmente | 13 de 14 |
| Concentracion territorial | 2 hotspots, 3 coldspots, 1 neutral |

Las tablas completas de pruebas y capturas de consola se encuentran en
`docs/reportes/fase-14.md` y `docs/reportes/evidencias/fase-14/`.

## 2. Analisis cualitativo con aplicacion de tecnicas

Se aplico revision funcional por flujos y trazabilidad con los objetivos:

- El ciudadano puede autenticarse con Google, registrar un reporte con categoria,
  urgencia, descripcion, GPS y fotografia, y consultar sus propios reportes.
- El gestor puede validar y atender reportes, consultar detalle y evidencia, usar
  filtros, paginacion, exportacion CSV, mapas e indicadores.
- La informacion territorial se presenta como apoyo exploratorio y evita
  conclusiones causales.
- La interfaz estadistica formula preguntas de gestion comprensibles y deja el
  nombre de la prueba como detalle metodologico.
- Los limites distritales tienen fuente trazable. Las zonas internas se declaran
  analiticas para no atribuirles precision administrativa inexistente.

La tecnica cualitativa principal fue la evaluacion de cumplimiento por escenario,
complementada con revision de usabilidad, mensajes de error, permisos,
autorizacion por rol y consistencia entre app, API y dashboard.

## 3. Analisis cuantitativo con aplicacion de tecnicas

Se aplicaron:

- conteos y agregaciones por categoria, zona, estado, urgencia y periodo;
- agrupacion espacial de puntos mediante `ST_SnapToGrid`;
- estandarizacion de conteos territoriales con puntuacion z para visualizacion
  exploratoria de hotspots y coldspots;
- Chi-cuadrado para asociacion entre variables categoricas;
- Mann-Whitney U para dos grupos independientes;
- Kruskal-Wallis para tres o mas grupos independientes;
- Spearman para relacion monotona entre urgencia y tiempo de atencion;
- pruebas automatizadas funcionales y de rendimiento definidas en la tesis.

Cada prueba estadistica devuelve estadistico, p-value, muestra e interpretacion
simple. Se informa evidencia de asociacion, diferencia o relacion cuando
`p < 0.05`; en caso contrario se informa que no existe evidencia suficiente. No
se realizan inferencias causales.

## Cumplimiento de objetivos

| Objetivo del sistema | Resultado |
|---|---|
| Captura georreferenciada con metadatos y foto | Cumplido |
| Gestion, estados, validacion e historial | Cumplido |
| PostgreSQL/PostGIS y almacenamiento espacial | Cumplido |
| Mapas interactivos y capas | Cumplido |
| Mapa de calor | Cumplido |
| Identificacion visual de hotspots y coldspots | Cumplido en modalidad exploratoria |
| Filtros por categoria, fecha, estado y zona | Cumplido |
| Indicadores visuales para decisiones | Cumplido |
| Analisis estadistico solo para gestores | Cumplido |
| Moran's I y Getis-Ord Gi* | Preparacion conceptual; no afirmados como ejecutados |

## Limitaciones

- El efecto real sobre decisiones municipales requiere validacion con usuarios en
  un entorno institucional.
- La sectorizacion municipal A-G se encontro en un mapa raster del plan de
  contingencia por sismos; requiere datos vectoriales oficiales o digitalizacion
  catastral validada antes de reemplazar las zonas analiticas.
- Moran's I y Getis-Ord Gi* requieren mas unidades espaciales y observaciones para
  una aplicacion e interpretacion responsable.
