# Fase 16 - Zonas territoriales y asignacion espacial

## Objetivo

Completar la infraestructura territorial necesaria para visualizar zonas, asignar
reportes mediante PostGIS y habilitar filtros e indicadores por zona.

## Datos territoriales

Se incorporo el limite publico del distrito de Jose Luis Bustamante y Rivero,
identificado como la relacion `1887802` de OpenStreetMap y consultado mediante
Nominatim.

Para el prototipo se generaron seis subdivisiones regulares recortadas por ese
limite. Se denominan `Zona analitica 1` a `Zona analitica 6` y se identifican
expresamente como zonas analiticas, no como sectores administrativos oficiales.
Esta distincion evita atribuir validez municipal a una sectorizacion creada para
el analisis exploratorio.

Fuentes:

- https://www.openstreetmap.org/relation/1887802
- https://nominatim.openstreetmap.org/

## Implementacion PostGIS

- Migracion `006_zonas_analiticas_y_asignacion.sql`.
- Metadatos de tipo, fuente y referencia en la tabla `zonas`.
- Seis poligonos `geometry(Polygon, 4326)` no superpuestos.
- Indice espacial GiST sobre `zonas.geom`.
- Trigger `trg_asignar_zona_reporte` para altas y cambios de ubicacion.
- Asignacion mediante `ST_Covers`, incluyendo puntos ubicados en el borde.
- Seleccion del poligono de menor superficie si existieran capas superpuestas.
- Reasignacion inicial de reportes historicos.
- Endpoint administrativo `POST /zonas/reasignar`.
- Comando reproducible `npm run db:verify:spatial`.

## Dashboard GIS

- El mapa inicia centrado en Jose Luis Bustamante y Rivero.
- La vista se ajusta a los poligonos distritales.
- Leaflet permite activar o desactivar las capas `Zonas analiticas`, `Reportes` y
  `Concentracion`.
- Cada poligono presenta su nombre.
- Cada reporte presenta categoria, estado y zona calculada.
- Los filtros e indicadores existentes reciben ahora las seis zonas desde la API.

## Resultados

| Verificacion | Resultado |
|---|---|
| Migracion 006 | Aplicada correctamente |
| Zonas con geometria | 6 |
| Reportes existentes | 14 |
| Reportes dentro del limite y asignados | 13 |
| Reportes fuera del limite | 1, conservado como `Sin zona` |
| Punto transaccional `-71.525, -16.43` | Asignado automaticamente a zona 5 |
| Persistencia del punto de prueba | Ninguna, se ejecuto `ROLLBACK` |
| Backend Jest | 15/15 aprobadas |
| Dashboard Vitest | 11/11 aprobadas |
| Build del dashboard | Correcto |

## Trazabilidad con la tesis

La fase cubre almacenamiento espacial de zonas, asignacion territorial de
reportes, visualizacion de capas y soporte efectivo de consultas e indicadores por
zona. La sustitucion futura por una sectorizacion oficial solo requiere importar
los nuevos poligonos y ejecutar la reasignacion; no exige cambiar el modelo ni el
flujo ciudadano.
