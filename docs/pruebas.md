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

## Fase 2

La validacion de esquema se ejecuta contra PostgreSQL/PostGIS con:

```bash
npm run db:check -w backend
```

Si faltan objetos, las migraciones incrementales se aplican con:

```bash
npm run db:migrate -w backend
```

El usuario administrador de prototipo se siembra por separado:

```bash
npm run db:seed:admin -w backend
```

## Fase 3

Pruebas iniciales del backend:

```bash
npm test -w backend
```

Cubren health check, OpenAPI, login administrativo, rechazo de credenciales invalidas y middleware Firebase con verificador inyectado.
