# Fase 24 - Integracion espacial en el dashboard

## Objetivo

Presentar Moran y Getis-Ord mediante preguntas comprensibles para gestores y capas
cartograficas separadas.

## Interfaz

Preguntas disponibles:

- Existe agrupacion espacial general?
- Donde se agrupan valores altos o bajos?
- Donde hay concentraciones significativas?

El gestor selecciona escala de 250 o 500 metros. Los filtros operativos de estado,
categoria, zona y periodo se aplican tambien al analisis espacial.

## Resultados

Moran global muestra:

- Moran's I;
- p-value;
- numero de unidades;
- interpretacion;
- advertencia de no causalidad;
- prueba utilizada como detalle metodologico.

Moran local y Getis-Ord muestran:

- unidades evaluadas;
- unidades significativas;
- correccion por comparaciones multiples;
- interpretacion;
- capa GeoJSON en el mapa.

## Capas Leaflet

- `Moran local (FDR)`.
- `Getis-Ord Gi* (FDR)`.

Moran local diferencia alto-alto, bajo-bajo, bajo-alto y alto-bajo. Getis-Ord
diferencia hotspot, coldspot y no significativo. Las unidades no significativas
usan una opacidad minima para evitar que parezcan resultados positivos.

## Verificacion

- Dashboard Vitest: 13/13.
- Build Vite: correcto.
- Endpoints Moran y Getis-Ord: operativos.
- Resultados GeoJSON: 64 unidades a escala de 500 metros.

La automatizacion visual del navegador integrado no estuvo disponible por un fallo
local de sus recursos. La fase conserva validacion DOM, TypeScript, build y API; la
captura visual se reintentara durante el cierre si la herramienta vuelve a estar
disponible.
