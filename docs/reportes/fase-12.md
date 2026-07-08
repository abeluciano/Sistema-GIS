# Fase 12 - Estabilizacion del formulario movil

## Objetivo

Corregir la carga de categorias, permisos nativos, retroalimentacion del formulario,
navegacion Android y sincronizacion del perfil ciudadano.

## Implementacion

- Se habilito CORS para el origen nativo `https://localhost`.
- El APK `debug` permite HTTP local para trabajar con ADB reverse; la variante de
  produccion conserva la exigencia de HTTPS.
- Se declararon permisos Android de ubicacion precisa, ubicacion aproximada y camara.
- El formulario solicita y valida permisos antes de usar GPS o camara.
- La captura GPS muestra confirmacion, coordenadas y mensajes de error claros.
- La fotografia muestra un estado compacto sin exponer rutas internas del dispositivo.
- Las categorias incluyen carga, reintento y nombres legibles.
- Se agregaron botones visuales de regreso en las pantallas secundarias.
- El boton Atrás fisico usa un unico listener y rutas de retorno deterministas.
- La sincronizacion Firebase enlaza perfiles ciudadanos existentes por correo y
  crea perfiles nuevos mediante un upsert compatible con el indice parcial.
- Una migracion de compatibilidad permite crear reportes en bases que aun conservan
  la columna textual antigua `reportes.categoria`.
- Se normalizaron las restricciones heredadas de urgencia y estado para que coincidan
  con el contrato vigente de la API.
- El backend cierra ordenadamente ante `SIGINT` y `SIGTERM`.

## Verificacion

- Backend: 5 suites y 12 pruebas aprobadas.
- Movil: 1 prueba aprobada y build Vite completado.
- Android: `assembleDebug` completado e APK instalado en dispositivo fisico.
- Se verificaron visualmente las siete categorias.
- Se verifico captura GPS con confirmacion y coordenadas.
- Se verifico el estado compacto de fotografia capturada.
- Se verifico Atrás fisico desde Nuevo reporte hacia Inicio ciudadano.
- Se verifico en base de datos un perfil ciudadano activo enlazado con Firebase.

## Resultado

El formulario movil queda operativo para seleccionar categoria, capturar ubicacion,
usar la camara, regresar de forma predecible y registrar reportes con un perfil
Firebase sincronizado.
