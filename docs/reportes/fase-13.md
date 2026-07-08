# Fase 13 - Operacion y paginacion del dashboard

## Objetivo

Completar las acciones de la tabla de reportes, convertir la lupa en un control
funcional y preparar el listado para cientos o miles de registros.

## Implementacion

- El endpoint `GET /reportes` ahora acepta `page` y `page_size`.
- La respuesta incluye pagina actual, filas por pagina, total y total de paginas.
- El backend limita el tamaño de pagina a 100 registros.
- El dashboard separa filtros editados de filtros aplicados.
- La lupa aplica los filtros y reinicia el listado en la primera pagina.
- La tabla inicia con 5 filas y permite seleccionar 5, 10 o 25.
- Se eliminaron el limite visual y el scroll vertical interno de la tabla.
- Se agregaron controles de pagina anterior, paginas numeradas y pagina siguiente.
- La accion Validar funciona para reportes pendientes.
- La accion Atender funciona para reportes validados.
- Las acciones muestran carga, confirmacion o error.
- La tercera accion abre un detalle con datos del reporte, ubicacion y fotografias.

## Verificacion

- API verificada con 14 registros, 5 filas por pagina y 3 paginas.
- Dashboard compilado correctamente.
- Backend: 5 suites y 12 pruebas aprobadas.
- Dashboard: 3 archivos de prueba y 3 pruebas aprobadas.
- Servidor actualizado disponible en `http://127.0.0.1:5175`.

## Resultado

La tabla queda preparada para crecimiento, con paginacion de servidor, filtros
explicitos y las tres acciones operativas.
