# Reporte de Fase 3 - Backend base

## Entregables

- Backend Express inicial en `backend/src/app.js` y `backend/src/server.js`.
- Configuracion centralizada de entorno, PostgreSQL y Firebase Admin.
- Middleware de errores, validacion Zod, autenticacion administrativa, autenticacion Firebase y roles.
- Login administrativo interno con JWT y cookie `httpOnly`.
- Health check `GET /health`.
- OpenAPI inicial en `GET /openapi.json`.
- Documentacion visual con Scalar en `GET /docs`.
- Tests iniciales con Jest y Supertest.

## Endpoints implementados

- `GET /health`
- `GET /openapi.json`
- `GET /docs`
- `POST /admin/login`
- `GET /admin/me`
- `POST /admin/logout`
- `GET /auth/firebase/profile`

## Validaciones ejecutadas

- `npm test -w backend`: 7 tests correctos.
- `npm test`: validacion estructural correcta.
- Busqueda de patrones sensibles conocidos: sin coincidencias en archivos versionables.
- `npm audit --omit=dev`: reporta 6 vulnerabilidades moderadas transitivas por `uuid` dentro de la cadena `firebase-admin` -> `@google-cloud/storage`. No se aplico `npm audit fix --force` porque propone un cambio rompedor sobre Firebase Admin.

## Observaciones

- Firebase Admin se carga de forma perezosa para evitar fallos en tests y permitir ejecucion local sin credenciales reales.
- El seed del administrador de prototipo sigue separado por seguridad.
- La autenticacion ciudadana real se completara en fases posteriores con sincronizacion de perfil.
