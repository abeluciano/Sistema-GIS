# Fase 21 - Cuadricula analitica y vecindad espacial

## Objetivo

Construir unidades espaciales regulares y una matriz de vecindad reproducible para
Moran's I y Getis-Ord Gi*.

## Implementacion PostGIS

- Migracion `008_spatial_analysis_units.sql`.
- Cuadriculas de 250 y 500 metros.
- Generacion en WGS 84 / UTM zona 19S, EPSG 32719.
- Recorte por el limite distrital.
- Almacenamiento final como MultiPolygon, SRID 4326.
- Eliminacion de fragmentos menores a 100 m2.
- Indice espacial GiST.
- Matriz de vecindad Queen con `ST_Touches`.
- Relaciones dirigidas entre cada unidad y todos sus vecinos.

Endpoint:

```text
GET /gis/unidades-analisis.geojson?tamanio=250
GET /gis/unidades-analisis.geojson?tamanio=500
```

El GeoJSON incluye codigo, area, conteo, densidad por kilometro cuadrado y numero
de vecinos. Acepta filtros por estado, categoria, zona y periodo.

## Resultados

| Metrica | 250 m | 500 m |
|---|---:|---:|
| Unidades | 213 | 64 |
| Unidades aisladas | 0 | 0 |
| Reportes dentro del distrito | 13 | 13 |
| Vecinos promedio | No requerido | 5.84 |

El reporte restante esta fuera del limite distrital y no se fuerza dentro de una
celda. La escala de 500 metros queda como valor inicial para el analisis actual,
mientras que 250 metros permite mayor detalle cuando aumente el volumen.

## Criterio metodologico

La vecindad Queen considera vecinas las celdas que comparten borde o vertice. La
ausencia de islas permite construir pesos espaciales estandarizados por fila sin
introducir vecinos artificiales.
