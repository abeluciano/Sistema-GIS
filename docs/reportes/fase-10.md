# Reporte de Fase 10 - Prueba movil en dispositivo Android

## Acciones ejecutadas

- Se genero el proyecto nativo Android con Capacitor para la app ciudadana.
- Se compilo el bundle web de la app movil y se sincronizo con Android.
- Se configuro `local.properties` de forma local para apuntar al SDK Android de la maquina.
- Se instalo el APK debug en el telefono conectado por ADB.
- Se activo `adb reverse tcp:4000 tcp:4000` para que la app en el telefono consuma el backend local.
- Se abrio la app instalada con paquete `com.sistemagis.ciudadano`.

## Ajustes de autenticacion y entorno

- La app movil usa `signInWithRedirect` en plataforma nativa Capacitor y mantiene `signInWithPopup` para navegador web.
- El backend puede inicializar Firebase Auth con `FIREBASE_PROJECT_ID` para validar ID tokens.
- Las credenciales completas de cuenta de servicio Firebase siguen siendo opcionales y no se versionan.
- `google-services.json`, `.env.local`, `backend/.env` y `local.properties` quedan fuera de Git.

## Validaciones ejecutadas

- `npm test -w backend`: 12 tests correctos.
- `npm test -w mobile`: 1 test correcto.
- `npm run build -w mobile`: correcto.
- `npm exec -w mobile cap sync android`: correcto.
- `gradlew assembleDebug`: correcto.
- `adb install -r app-debug.apk`: correcto.
- Lectura de logs recientes: sin crash de la app al iniciar.

## Observaciones

- El backend quedo levantado en `http://localhost:4000`.
- El dashboard sigue disponible en `http://127.0.0.1:5175/`.
- Para probar registro ciudadano desde el telefono, se debe mantener conectado el cable USB y activo el `adb reverse`.
- Si Google bloquea el login en WebView, la siguiente mejora tecnica sera registrar correctamente la app Android en Firebase y migrar el login movil a autenticacion nativa.
