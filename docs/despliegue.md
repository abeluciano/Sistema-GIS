# Despliegue

El despliegue final se documentara cuando existan backend, dashboard y app movil implementados.

## Consideraciones iniciales

- Backend preparado para Linux con Node.js 18+.
- Base de datos externa PostgreSQL + PostGIS.
- Dashboard como build estatico de React.
- App movil empaquetada con Capacitor para Android 8.0+.
- HTTPS/TLS obligatorio en entornos publicados.
- Credenciales mediante variables de entorno o archivos locales no versionados.
- Fotografias en storage local controlado para prototipo academico.

## Variables locales

Para validar la base de datos en desarrollo:

```bash
cd backend
cp .env.example .env
npm run db:check
```

El archivo `.env` no debe versionarse.

Para crear o actualizar el administrador de prototipo de forma explicita:

```bash
cd backend
ADMIN_BOOTSTRAP_USER=admin ADMIN_BOOTSTRAP_PASSWORD=admin npm run db:seed:admin
```

Estas credenciales son solo para entorno academico/prototipo y deben cambiarse antes de produccion o demos publicas.

## Variables obligatorias por entorno

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `ADMIN_SESSION_SECRET`
- `CORS_ORIGIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Variables operativas

- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_MAX`
- `UPLOADS_DIR`
- `MAX_REPORT_PHOTOS`
- `MAX_UPLOAD_MB`
- `UPLOAD_ORPHAN_RETENTION_DAYS`

## Validaciones previas a entrega

```bash
npm run security:audit
npm run check:structure
npm test -w backend
npm run build -w dashboard
npm run build -w mobile
```

No se deben copiar credenciales reales a archivos versionados. Firebase Web para dashboard y movil debe cargarse mediante `.env.local` o variables del proveedor de despliegue.
