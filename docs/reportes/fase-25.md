# Fase 25 - Cierre de objetivos, evidencia y tesis actualizada

## Alcance

Esta fase consolida el cierre tecnico del prototipo frente a los objetivos de la
tesis y deja evidencia ejecutable de backend, dashboard, aplicacion movil,
PostGIS, analisis espacial y documento actualizado.

Tambien se actualizo la trazabilidad interna para reflejar que Moran's I y
Getis-Ord Gi* ya no estan solo preparados conceptualmente: quedaron
implementados en backend, documentados en OpenAPI, consumidos por el dashboard y
representados como capas GeoJSON.

## Resultado general

El sistema cumple el objetivo general y los tres objetivos especificos del
alcance de software:

| Objetivo | Estado | Evidencia |
|---|---|---|
| Desarrollar un sistema GIS de reportes ciudadanos para apoyar decisiones de seguridad ciudadana | Cumplido | App movil, API REST, PostgreSQL/PostGIS y dashboard administrativo integrados |
| Captura y gestion de reportes georreferenciados con metadatos y controles de calidad | Cumplido | Google Sign-In, GPS, categoria, urgencia, descripcion, fotografia, estados, validacion e historial |
| Infraestructura GIS para almacenamiento, visualizacion, capas, hotspots y coldspots | Cumplido | PostGIS, sectores A-G, GeoJSON, Leaflet, mapa de calor, hotspots/coldspots, Moran's I y Getis-Ord Gi* |
| Modulo de analisis y consulta con filtros e indicadores visuales | Cumplido | Filtros por categoria, fecha, estado, urgencia y zona; KPI, graficos, comparaciones temporales, CSV y analisis estadistico |

## Requisitos funcionales cubiertos

| Requisito / modulo | Estado | Implementacion |
|---|---|---|
| Registro ciudadano | Cumplido | App movil Ionic/React/Capacitor con Firebase Auth |
| Captura GPS | Cumplido | Geolocation en movil y almacenamiento `POINT` SRID 4326 |
| Evidencia fotografica | Cumplido | Camara movil, subida a API, asociacion a reporte, visualizacion y eliminacion administrativa |
| Categorias y urgencia | Cumplido | Catalogos API y formulario movil |
| Gestion administrativa | Cumplido | Dashboard con login admin, tabla paginada, detalle, validacion, atencion, rechazo y archivado |
| Zonas territoriales | Cumplido | Sectores A-G importados como `MULTIPOLYGON`, GeoJSON y asignacion automatica por PostGIS |
| Mapa interactivo | Cumplido | React Leaflet, OpenStreetMap, marcadores, zonas, filtros y capas |
| Mapa de calor | Cumplido | Capa heatmap filtrable en dashboard |
| Hotspots/coldspots descriptivos | Cumplido | Agregacion espacial y clasificacion exploratoria con leyenda |
| Moran's I | Cumplido | Global y local con PySAL, pesos Queen, 999 permutaciones y FDR |
| Getis-Ord Gi* | Cumplido | GeoJSON con PySAL, diagonal explicita, 999 permutaciones y FDR |
| Indicadores | Cumplido | Totales por estado, categoria, zona, urgencia y periodo |
| Comparaciones temporales | Cumplido | Endpoint y panel de comparacion por periodos con exportacion CSV |
| Analisis estadistico | Cumplido | Chi-cuadrado, Mann-Whitney, Kruskal-Wallis y Spearman; Wilcoxon/Friedman documentadas para datos pareados |
| OpenAPI/Scalar | Cumplido | Endpoints de reportes, catalogos, indicadores, estadistica, GIS y analisis espacial |

## Evidencia de pruebas

| Componente | Resultado | Evidencia |
|---|---:|---|
| Backend Jest | 17/17 | `docs/reportes/evidencias/fase-25/backend-tests.txt` y `.png` |
| Dashboard Vitest | 13/13 | `docs/reportes/evidencias/fase-25/dashboard-tests.txt` y `.png` |
| Movil Vitest | 18/18 | `docs/reportes/evidencias/fase-25/mobile-tests.txt` y `.png` |
| Python espacial | 4/4 | `docs/reportes/evidencias/fase-25/python-spatial-tests.txt` y `.png` |
| Build dashboard | Correcto | `docs/reportes/evidencias/fase-25/dashboard-build.txt` y `.png` |
| Build movil | Correcto | `docs/reportes/evidencias/fase-25/mobile-build.txt` y `.png` |
| Verificacion PostGIS | Correcta | `docs/reportes/evidencias/fase-25/db-verify-spatial.txt` y `.png` |
| Endpoints Moran/Getis vivos | Correctos | `docs/reportes/evidencias/fase-25/spatial-endpoints-live.json` y `.png` |

Resumen automatizado: 52 pruebas pasadas sobre 52, considerando backend,
dashboard, movil y Python espacial.

## Resultado espacial validado

| Analisis | Resultado |
|---|---|
| Zonas activas | 7 sectores A-G |
| Reportes existentes | 14 |
| Reportes asignados espacialmente | 13 |
| Unidades de analisis 500 m | 64 |
| Moran's I global | 0.309265 |
| p-value Moran global | 0.005 |
| Interpretacion | Existe evidencia de autocorrelacion espacial positiva |
| Moran local | 64 features GeoJSON, sin unidades significativas tras FDR |
| Getis-Ord Gi* | 64 features GeoJSON, clase `no_significativo` tras FDR |

La ausencia de unidades locales significativas no invalida la implementacion:
indica que, con la muestra actual, no existe evidencia local suficiente despues
de correccion por multiples comparaciones.

## Documento de tesis

Se genero `output/Tesis_4ta_actualizada.docx` con seis parrafos actualizados en
resultados, limitaciones, conclusiones y trabajos futuros.

Cambios principales:

- Se incorporo evidencia de dashboard, comparaciones temporales y analisis
  espacial.
- Se actualizaron conclusiones para indicar cumplimiento de sectores A-G,
  unidades 250/500 m, Moran's I y Getis-Ord Gi*.
- Se mantuvo el sistema como analisis territorial exploratorio, no como
  prediccion delictiva.
- La IA queda aceptada solo como trabajo futuro para investigaciones posteriores,
  no como funcionalidad implementada del prototipo.

Verificacion estructural del DOCX:

| Revision | Resultado |
|---|---|
| Parrafos | 977 |
| Tablas | 9 |
| Parrafos reemplazados | 6 |
| Render visual con LibreOffice | No ejecutado: `soffice` no esta instalado en el entorno |

## Limitaciones reales

- El impacto operativo debe validarse con ciudadanos, gestores municipales y
  personal de seguridad en entorno real.
- Los sectores A-G fueron digitalizados desde un mapa raster municipal
  referencial; para uso institucional definitivo conviene obtener cartografia
  vectorial oficial.
- Moran local y Getis-Ord Gi* requieren mas reportes para aumentar potencia
  local.
- Los builds muestran advertencias de bundle grande por dependencias GIS/movil;
  no bloquean el prototipo, pero pueden optimizarse con particion dinamica.

## Cierre

El prototipo queda alineado con los objetivos y requisitos de la tesis. Los
trabajos futuros pueden incluir validacion real, cartografia oficial, mayor
volumen de observaciones, integracion institucional y, si otro trabajo lo decide,
lineas de IA o modelos predictivos como ampliacion posterior claramente separada
del alcance de esta implementacion.
