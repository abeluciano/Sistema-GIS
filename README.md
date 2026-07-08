# Sistema GIS de Reportes Ciudadanos

Sistema de tesis orientado al registro de reportes ciudadanos georreferenciados y al apoyo de la toma de decisiones en seguridad ciudadana para el distrito de Jose Luis Bustamante y Rivero, Arequipa.

## Alcance inicial

- App movil ciudadana con Ionic + React + Capacitor.
- Dashboard administrativo con React + Leaflet + OpenStreetMap.
- Backend con Node.js + Express y API REST.
- Base de datos PostgreSQL + PostGIS.
- Autenticacion ciudadana con Firebase Auth y Google Sign-In.
- Autenticacion interna para gestores y administradores del dashboard.
- Storage local controlado para fotografias de reportes.
- Indicadores, filtros, GeoJSON, mapas de calor y analisis espacial exploratorio.
- Submodulo de analisis estadistico exploratorio solo para dashboard administrativo.

El MVP puede iniciar con visualizacion GeoJSON, filtros, agregaciones espaciales e indicadores basicos, dejando preparada la estructura para incorporar progresivamente mapas de calor, Moran's I y Getis-Ord Gi*, sin que el sistema se enfoque en modelos predictivos.

## Estructura del monorepo

```text
backend/    API REST, autenticacion, reportes, GIS, indicadores y estadistica.
dashboard/  Panel web administrativo para gestores y administradores.
mobile/     Aplicacion ciudadana Ionic + React + Capacitor.
database/   Migraciones, seeders y scripts de validacion de esquema.
docs/       Arquitectura, endpoints, pruebas, despliegue y trazabilidad.
scripts/    Utilidades locales del monorepo.
```

## Seguridad de credenciales

No se deben commitear credenciales reales. Los archivos `.env`, `.env.local`, `google-services.json`, llaves privadas y cuentas de servicio estan ignorados por Git. Los valores reales deben vivir solo en archivos locales o variables de entorno del entorno de ejecucion.

Archivos de ejemplo:

- `.env.example`
- `backend/.env.example`
- `dashboard/.env.example`
- `mobile/.env.example`

## Comandos disponibles

```bash
npm run check:structure
npm test
```

En esta fase no se instalan dependencias de framework. Los proyectos `backend`, `dashboard` y `mobile` quedan preparados para implementarse en fases posteriores.

## Estado de fases

- Fase 0: planificacion y trazabilidad con tesis revisada hasta antes de "Pruebas del Sistema".
- Fase 1: preparacion del repositorio y estructura base.

