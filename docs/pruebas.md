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

## Fase 4

La suite backend agrega pruebas unitarias del servicio estadistico exploratorio:

```bash
npm test -w backend
```

Casos cubiertos:

- Chi-cuadrado con tabla de contingencia.
- Mann-Whitney U.
- Kruskal-Wallis.
- Spearman.

## Fase 5

Validacion de la app movil ciudadana:

```bash
npm run build -w mobile
npm test -w mobile
```

Validacion cruzada ejecutada en la fase:

```bash
npm test -w backend
npm run check:structure
```

El alcance movil validado cubre autenticacion ciudadana, navegacion protegida, registro de reportes, consulta de reportes propios y acceso a emergencia. No incluye analisis estadistico ni funciones administrativas.

## Fase 6

Validacion del dashboard administrativo:

```bash
npm run build -w dashboard
npm test -w dashboard
```

Validacion cruzada ejecutada en la fase:

```bash
npm test -w backend
npm test -w mobile
npm run check:structure
```

La prueba del dashboard cubre el panel de analisis estadistico con preguntas de gestion y detalle metodologico separado.
