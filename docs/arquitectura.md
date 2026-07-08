# Arquitectura

El sistema se organiza en tres capas:

1. Presentacion: app movil ciudadana y dashboard administrativo.
2. Logica de negocio: API REST Node.js + Express.
3. Datos: PostgreSQL + PostGIS y storage local controlado para fotografias.

La app movil se enfoca en ciudadanos reportadores. El dashboard queda reservado para gestores y administradores. Ambos clientes se comunican con la API mediante HTTPS/TLS en entornos desplegados.

## Componentes implementados

- App movil: Ionic + React + Capacitor, Firebase Auth con Google Sign-In, GPS, camara, reportes y emergencia.
- Dashboard: React + Leaflet, mapa, filtros, reportes, indicadores y analisis estadistico exploratorio para gestores.
- Backend: Express, autenticacion Firebase, autenticacion administrativa, roles, validacion de datos, storage local, GIS, indicadores y documentacion OpenAPI/Scalar.
- Base de datos: Neon PostgreSQL + PostGIS con geometria `POINT` para reportes y `POLYGON` para zonas, ambas en SRID 4326.

## Alcance GIS y estadistico

El analisis GIS incluye visualizacion georreferenciada, GeoJSON, filtros, mapas de calor, hotspots, coldspots, analisis espacial exploratorio, Moran's I y Getis-Ord Gi* segun viabilidad.

El analisis estadistico exploratorio sera exclusivo del dashboard administrativo. La interfaz debe presentar preguntas comprensibles para gestores, y el backend seleccionara o validara internamente la prueba estadistica pertinente.

El MVP inicia con visualizacion GeoJSON, filtros, agregaciones espaciales e indicadores basicos, dejando preparada la estructura para incorporar progresivamente mapas de calor, Moran's I y Getis-Ord Gi*, sin que el sistema se enfoque en modelos predictivos.
