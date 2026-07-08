# Reporte de Fase 5 - App movil ciudadana

## Entregables

- Aplicacion movil Ionic + React + Capacitor para ciudadanos.
- Configuracion Vite, TypeScript y Capacitor Android.
- Configuracion Firebase Web mediante variables de entorno, sin credenciales reales versionadas.
- Flujo de autenticacion ciudadana con Google/Firebase.
- Sincronizacion de perfil ciudadano con el backend mediante `POST /auth/firebase/sync`.
- Pantallas principales:
  - bienvenida e inicio de sesion;
  - inicio ciudadano;
  - nuevo reporte;
  - mis reportes;
  - detalle de reporte;
  - emergencia.
- Captura de ubicacion GPS con Capacitor Geolocation.
- Captura de fotografia con Capacitor Camera, preparada para integrarse con subida backend.
- Consumo de endpoints ciudadanos:
  - categorias activas;
  - crear reporte;
  - consultar mis reportes.
- Navegacion protegida por usuario autenticado.
- Prueba inicial de pantalla de bienvenida.

## Alcance ciudadano

- La app movil permite registrar reportes, consultar reportes propios y acceder a emergencia.
- No incluye analisis estadistico, GIS administrativo, indicadores de gestion ni funciones de administracion.
- El modulo estadistico queda reservado al dashboard administrativo para gestores y administradores.

## Validaciones ejecutadas

- `npm run build -w mobile`: correcto.
- `npm test -w mobile`: 1 test correcto.
- `npm test -w backend`: 11 tests correctos.
- `npm run check:structure`: correcto.

## Observaciones

- El archivo real `google-services.json` no fue copiado al repositorio.
- La configuracion Firebase del dashboard y movil debe ingresarse mediante archivos `.env` locales o variables del entorno de despliegue.
- El build de Vite advierte que el bundle principal supera 500 kB por dependencias Ionic/Firebase; no bloquea la fase y puede optimizarse con code splitting en una fase de rendimiento.
