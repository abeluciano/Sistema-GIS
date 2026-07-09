# Fase 19 - Sectores municipales A-G

## Objetivo

Sustituir la rejilla territorial provisional por los siete sectores identificados
en el Plan de Contingencia por Sismos de la Municipalidad Distrital de Jose Luis
Bustamante y Rivero.

## Fuente

- Entidad: GDU - MDJLBYR.
- Documento: Plan de Contingencia por Sismos, 2019.
- Paginas: 54 y 55.
- URL: https://www.munibustamante.gob.pe/archivos/1698080373.pdf
- Limite exterior: OpenStreetMap, relacion 1887802.

El documento municipal publica el mapa como una imagen raster de 636 x 641
pixeles. No contiene vertices vectoriales ni una capa GIS descargable. Por ello,
las lineas internas se registran como digitalizacion referencial y no como
geometria catastral.

## Procedimiento

1. Se extrajo la imagen original embebida en el PDF.
2. OpenCV separo automaticamente los colores de los sectores A-G.
3. Se cerraron interrupciones producidas por calles, textos y lineas del mapa.
4. Los contornos se simplificaron y transformaron a coordenadas geograficas.
5. PostGIS recorto cada sector contra el limite distrital vectorial.
6. Los solapamientos raster se eliminaron de forma determinista.
7. Los huecos se asignaron al sector contiguo mas cercano.
8. Las geometrías se almacenaron como `MultiPolygon, SRID 4326`.
9. La rejilla provisional se desactivo y los reportes se reasignaron.

El proceso es reproducible mediante:

```text
tools/digitize_municipal_sectors.py
backend/scripts/import-municipal-sectors.mjs
```

## Sectores

| Codigo | Nombre |
|---|---|
| A | Lambramani |
| B | Adepa - Bancarios |
| C | Plataforma C.C. Andres Avelino Caceres |
| D | Cerro Juli |
| E | Villa Electrica - Fecia Las Begonias - Melgariana |
| F | 13 de Enero - Juan Pablo Vizcardo y Guzman - Satelite Grande - Mi Peru - Dolores - Monterrey |
| G | Simon Bolivar - Las Esmeraldas |

## Validacion topologica

| Metrica | Resultado |
|---|---:|
| Area distrital | 10,626,385.55 m2 |
| Area cubierta | 10,626,385.47 m2 |
| Cobertura | 100.00% |
| Hueco residual numerico | 0.07 m2 |
| Solapamiento residual numerico | 1.47 m2 |
| Sectores activos | 7 |
| Reportes existentes | 14 |
| Reportes asignados | 13 |
| Reportes fuera del distrito | 1 |

El solapamiento residual equivale a una diferencia numerica despreciable frente al
area distrital y no afecta la seleccion, que usa `ST_Covers` y un orden
determinista.

## Pruebas

- Backend Jest: 15/15.
- Trigger PostGIS: correcto.
- Punto de control: asignado al sector correspondiente.
- Persistencia del punto de prueba: ninguna, se ejecuto `ROLLBACK`.

## Limitacion declarada

Los nombres y la configuracion visual provienen de una fuente municipal real. La
precision de las divisiones internas esta limitada por la resolucion del raster.
Para uso catastral o institucional deben sustituirse por archivos DWG, SHP o
GeoJSON validados por la municipalidad.
