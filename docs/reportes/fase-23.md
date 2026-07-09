# Fase 23 - Getis-Ord Gi*

## Objetivo

Identificar hotspots y coldspots con significancia estadistica, diferenciandolos
de la clasificacion descriptiva por puntuacion z ya existente.

## Metodo

- Biblioteca: PySAL `esda.G_Local`.
- Variante: Gi* con diagonal explicita para incluir la propia unidad.
- Pesos: Queen estandarizados por fila.
- Permutaciones: 999.
- Semilla: 42.
- Hipotesis: bilateral.
- Correccion multiple: Benjamini-Hochberg FDR 0.05.

Endpoint:

```text
GET /analisis/espacial/getis-ord.geojson
```

La respuesta GeoJSON incluye por celda:

- valor observado;
- estadistico Gi*;
- z-score;
- p-value por permutacion;
- p-value ajustado;
- clasificacion hotspot, coldspot o no significativo.

## Resultado actual, cuadricula de 500 m

| Metrica | Resultado |
|---|---:|
| Unidades | 64 |
| Reportes dentro del distrito | 13 |
| Permutaciones | 999 |
| Hotspots significativos despues de FDR | 0 |
| Coldspots significativos despues de FDR | 0 |
| Unidades no significativas | 64 |

Este resultado no es un error. El volumen actual no ofrece evidencia suficiente
para declarar hotspots o coldspots inferenciales tras controlar comparaciones
multiples. La capa descriptiva de concentracion puede seguir mostrando zonas altas
y bajas, pero no debe confundirse con Gi*.

## Pruebas

- Python unittest: 4/4.
- Backend Jest: 17/17.
- p-values ajustados limitados al intervalo 0-1.
- Valores constantes, islas o muestra insuficiente: respuesta no ejecutable.

## Advertencia

Getis-Ord Gi* es analisis estadistico espacial exploratorio. No representa
prediccion, machine learning ni evidencia causal.
