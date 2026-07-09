# Fase 22 - Moran's I global y local

## Objetivo

Evaluar autocorrelacion espacial global y patrones locales sobre las unidades
regulares del distrito.

## Motor

- Biblioteca: PySAL.
- Global: `esda.Moran`.
- Local: `esda.Moran_Local`.
- Pesos: vecindad Queen estandarizada por fila.
- Permutaciones: 999.
- Semilla: 42.
- Hipotesis local: bilateral.
- Comparaciones multiples: Benjamini-Hochberg FDR 0.05.

Node obtiene conteos y vecinos desde PostgreSQL/PostGIS y ejecuta un worker Python
interno. No se reimplementaron manualmente las formulas de Moran.

## Endpoints

```text
GET /analisis/espacial/moran
GET /analisis/espacial/moran-local.geojson
```

Ambos aceptan escala de 250 o 500 metros y filtros por estado, categoria, zona y
periodo.

## Resultado actual, cuadricula de 500 m

| Metrica | Resultado |
|---|---:|
| Unidades | 64 |
| Reportes dentro del distrito | 13 |
| Moran's I | 0.309265 |
| Valor esperado | -0.015873 |
| p-value por permutacion | 0.005 |
| Permutaciones | 999 |
| Resultado global | Autocorrelacion espacial positiva |
| Unidades locales significativas despues de FDR | 0 |

El resultado global indica que existe evidencia de agrupacion general de valores
similares. La ausencia de unidades locales significativas despues de FDR indica
que los datos actuales no permiten ubicar clusters individuales con suficiente
evidencia una vez controladas las comparaciones multiples.

## Validaciones

- Python unittest: 3/3.
- Backend Jest: 17/17.
- Valores constantes: prueba no ejecutable.
- Menos de ocho unidades: prueba no ejecutable.
- Unidades aisladas: prueba no ejecutable.
- Respuesta local: GeoJSON.

## Advertencia

Moran describe autocorrelacion, no causalidad. Los resultados no constituyen
prediccion ni machine learning y deben interpretarse considerando el bajo volumen
de reportes disponible.
