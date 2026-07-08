# Reporte de Fase 11 - Correccion de login Google movil

## Problema detectado

- El login Google en Android usaba el flujo web de Firebase.
- Ese flujo abria navegador externo y terminaba redirigiendo a `localhost/welcome`, que no corresponde al backend local ni a la WebView de Capacitor.
- El `google-services.json` disponible esta registrado para el paquete Android `com.jlbr.reportes`.

## Acciones ejecutadas

- Se reemplazo el login Android por autenticacion nativa con `@capacitor-firebase/authentication`.
- Se mantuvo el login web con `signInWithPopup`.
- Se alineo el paquete Android con Firebase: `com.jlbr.reportes`.
- Se copio localmente `google-services.json` a `mobile/android/app/google-services.json`; el archivo sigue ignorado por Git.
- Se forzo Google Sign-In clasico con `useCredentialManager: false` para evitar el error `No credentials available`.
- Se agrego mensaje visible en la pantalla de bienvenida cuando Google/Firebase devuelve error.

## Validaciones ejecutadas

- `npm test -w mobile`: correcto.
- `npm run build -w mobile`: correcto.
- `npm exec -w mobile cap sync android`: correcto.
- `gradlew assembleDebug`: correcto.
- `adb install -r app-debug.apk`: correcto.
- `adb reverse tcp:4000 tcp:4000`: activo.

## Pendiente externo

- En Firebase Console se debe registrar la huella SHA-1/SHA-256 del debug keystore local para el paquete `com.jlbr.reportes`.
- Luego se debe descargar nuevamente `google-services.json`, reemplazar el archivo local en `mobile/android/app/` y recompilar el APK.
