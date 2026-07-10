# Sistema GIS de Reportes Ciudadanos

Sistema de tesis para el registro, gestion y analisis territorial de reportes ciudadanos de seguridad en el distrito de Jose Luis Bustamante y Rivero, Arequipa.

La solucion esta compuesta por una app movil ciudadana, una API REST, una base de datos PostgreSQL/PostGIS y un dashboard administrativo con mapas e indicadores. El sistema se orienta a visualizacion georreferenciada, filtros, gestion administrativa, mapas de calor, hotspots/coldspots e indicadores territoriales. No implementa prediccion ni modelos de machine learning.

## Modulos

- **App movil ciudadana:** registro de reportes con Google Sign-In, categoria, urgencia, descripcion, ubicacion GPS y fotografia.
- **Backend API REST:** autenticacion, reportes, categorias, zonas, fotos, indicadores, GIS, estadistica exploratoria y documentacion Scalar/OpenAPI.
- **Base de datos:** PostgreSQL + PostGIS para reportes georreferenciados, zonas territoriales, historial y evidencias fotograficas.
- **Dashboard administrativo:** gestion de reportes, validacion/cambio de estado, visualizacion de fotografias, filtros, mapas Leaflet/OpenStreetMap, heatmap, indicadores y analisis estadistico para gestores.

## Alcance GIS y analitico

- Visualizacion de reportes georreferenciados.
- Generacion de mapas de calor.
- Identificacion exploratoria de hotspots y coldspots.
- Filtros por categoria, zona, estado, urgencia y periodo.
- Indicadores por categoria, zona, estado y periodo.
- Analisis estadistico exploratorio no parametrico y categorico para dashboard administrativo.
- Estructura preparada para Moran's I y Getis-Ord Gi* segun disponibilidad y calidad de datos.

El MVP puede iniciar con visualizacion GeoJSON, filtros, agregaciones espaciales e indicadores basicos, dejando preparada la estructura para incorporar progresivamente mapas de calor, Moran's I y Getis-Ord Gi*, sin que el sistema se enfoque en modelos predictivos.

## Estructura del monorepo

```text
backend/    API REST, autenticacion, reportes, GIS, indicadores, fotos y estadistica.
dashboard/  Panel web administrativo para gestores y administradores.
mobile/     Aplicacion ciudadana Ionic + React + Capacitor.
database/   Migraciones, seeders y scripts de validacion de esquema.
docs/       Arquitectura, endpoints, pruebas, despliegue y trazabilidad.
scripts/    Utilidades locales del monorepo.
output/     Artefactos locales generados, como APKs de prueba.
```

## Requisitos

- Node.js 18 o superior.
- PostgreSQL con extension PostGIS.
- Android SDK y Gradle para generar APK.
- Proyecto Firebase configurado para autenticacion Google.

## Variables y credenciales

No se deben commitear credenciales reales. Los archivos `.env`, `.env.local`, `google-services.json`, llaves privadas y cuentas de servicio estan ignorados por Git.

Archivos de ejemplo:

- `.env.example`
- `backend/.env.example`
- `dashboard/.env.example`
- `mobile/.env.example`

Variables clave:

- `DATABASE_URL`
- `CORS_ORIGIN`
- `JWT_ACCESS_SECRET`
- `ADMIN_SESSION_SECRET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `UPLOADS_DIR`
- `VITE_API_BASE_URL`

## Instalacion local

```bash
npm install
npm run check:structure
```

Backend:

```bash
npm run db:migrate -w backend
npm run db:seed:admin -w backend
npm run dev -w backend
```

Dashboard:

```bash
npm run dev -w dashboard
```

App movil:

```bash
npm run dev -w mobile
```

## Builds

Dashboard:

```bash
npm run build -w dashboard
```

App movil web:

```bash
npm run build -w mobile
```

APK Android debug:

```bash
cd mobile
npx cap sync android
cd android
./gradlew assembleDebug
```

Artefacto esperado:

```text
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

En este entorno tambien se deja una copia local en:

```text
output/SistemaGIS-Ciudadano-azure-debug.apk
```

## Compatibilidad Android

Configuracion actual:

- `minSdkVersion`: 24
- `targetSdkVersion`: 36
- `compileSdkVersion`: 36
- `versionCode`: 1
- `versionName`: 1.0
- `applicationId`: `com.jlbr.reportes`

Soporte practico:

- Android minimo: Android 7.0 Nougat, API 24.
- Android objetivo: Android 16, API 36.
- La app requiere permisos de camara, ubicacion e internet.

## Pruebas

```bash
npm test -w backend
npm test -w dashboard
npm test -w mobile
npm run security:audit
```

Pruebas y evidencias ampliadas:

- `docs/pruebas.md`
- `docs/reportes/`

## Despliegue

Backend:

- Ejecuta Node.js/Express.
- Requiere PostgreSQL/PostGIS accesible mediante `DATABASE_URL`.
- Debe exponer HTTPS para consumo desde app movil y dashboard web.
- La carpeta de fotografias se controla mediante `UPLOADS_DIR`.

Dashboard:

- Aplicacion Vite/React lista para Vercel.
- En produccion debe usar `VITE_API_BASE_URL` apuntando al backend HTTPS.
- El cliente evita usar `localhost` como API base en builds productivos.

App movil:

- Ionic + React + Capacitor.
- Usa Firebase Auth con Google Sign-In.
- Consume la API publica configurada en `VITE_API_BASE_URL`.

## Documentacion

- `docs/arquitectura.md`
- `docs/endpoints.md`
- `docs/pruebas.md`
- `docs/despliegue.md`
- `docs/seguridad-operacion.md`
- `docs/trazabilidad-tesis.md`
- `docs/reportes/`

## Estado funcional

- Registro ciudadano con ubicacion GPS y fotografia.
- Consulta de reportes del ciudadano.
- Emergencias desde la app movil.
- Dashboard administrativo con login, gestion de estados, evidencias y filtros.
- Mapas interactivos, GeoJSON, heatmap, indicadores y comparaciones.
- Analisis estadistico exploratorio para gestores.
- Migraciones para compatibilidad de esquema legacy de evidencias fotograficas.
