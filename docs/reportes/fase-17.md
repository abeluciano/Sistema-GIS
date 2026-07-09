# Fase 17 - Mapa de calor, hotspots y coldspots

## Objetivo

Completar el analisis espacial exploratorio visual sin presentar sus resultados
como prediccion ni como una prueba inferencial que aun no se ha ejecutado.

## Mapa de calor

- Se incorporo `leaflet.heat`, una extension especializada de Leaflet.
- La API agrupa reportes en celdas aproximadas de 0.001 grados mediante
  `ST_SnapToGrid`.
- Cada celda devuelve latitud, longitud e intensidad.
- La capa usa una escala azul, verde, amarilla y roja.
- Estado, categoria, zona y periodo se aplican tambien al mapa de calor.

## Hotspots y coldspots

Se agrego `GET /gis/concentracion-zonas.geojson`. El endpoint:

1. cuenta reportes por zona;
2. calcula media y desviacion poblacional;
3. estandariza cada conteo como puntuacion z;
4. clasifica como hotspot si `z >= 0.75`, coldspot si `z <= -0.75` y neutral
   en los demas casos.

El umbral se declara en la respuesta. Fue elegido como criterio exploratorio para
el prototipo de seis zonas y no representa significancia estadistica. La respuesta
advierte expresamente que no implica causalidad y que no corresponde a
Getis-Ord Gi*.

El dashboard incluye una capa conmutable, colores rojo, gris y azul, leyenda,
conteo y puntuacion z por zona.

## Contraste territorial

La imagen compartida por el usuario confirma la ubicacion general del distrito,
pero no permite recuperar coordenadas GIS.

Se reviso el Plan de Contingencia por Sismos de la Municipalidad Distrital de Jose
Luis Bustamante y Rivero, 2019. Las paginas 54 y 55 definen siete sectores:

| Sector | Nombre municipal |
|---|---|
| A | Lambramani |
| B | Adepa - Bancarios |
| C | Plataforma C.C. Andres Avelino Caceres |
| D | Cerro Juli |
| E | Villa Electrica - Fecia Las Begonias - Melgariana |
| F | 13 de Enero - Juan Pablo Vizcardo y Guzman - Satelite Grande - Mi Peru - Dolores - Monterrey |
| G | Simon Bolivar - Las Esmeraldas |

El propio documento indica que esa sectorizacion fue creada unicamente para el
plan de contingencia por sismos. Como el anexo es un mapa raster sin vertices
georreferenciados publicados, no se convirtio en limites exactos. El sistema
conserva el limite distrital vectorial y sus zonas analiticas declaradas, evitando
atribuir precision catastral a una digitalizacion aproximada.

Fuente municipal:
https://www.munibustamante.gob.pe/archivos/1698080373.pdf

## Resultados con los datos actuales

| Verificacion | Resultado |
|---|---|
| Celdas del mapa de calor | 14 |
| Zonas evaluadas | 6 |
| Hotspots | 2 |
| Coldspots | 3 |
| Zonas neutrales | 1 |
| Backend Jest | 15/15 aprobadas |
| Dashboard Vitest | 11/11 aprobadas |
| Build del dashboard | Correcto |

## Trazabilidad con la tesis

La fase implementa mapas de calor e identificacion visual exploratoria de hotspots
y coldspots. Moran's I y Getis-Ord Gi* permanecen como ampliaciones progresivas
que requieren mayor cantidad de unidades espaciales y datos antes de ofrecer una
interpretacion metodologicamente responsable.
