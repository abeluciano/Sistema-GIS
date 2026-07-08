# Pruebas

Las pruebas reales se construiran a partir del codigo implementado. No se usara la seccion de pruebas de la tesis como fuente para definir pruebas iniciales.

## Plan previsto

- Backend: Jest, Supertest, autenticacion, roles, CRUD, reportes georreferenciados, fotos, indicadores, GeoJSON y OpenAPI.
- Dashboard: Vitest y React Testing Library para login, mapa/contenedor, filtros, KPIs, reportes y analisis estadistico.
- Mobile: pruebas de servicios, formularios, validacion y componentes principales.
- Carga: endpoints criticos como `/health`, `/reportes`, `POST /reportes` e indicadores.

## Fase 1

La validacion disponible en esta fase es estructural:

```bash
npm run check:structure
```
