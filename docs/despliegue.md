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
