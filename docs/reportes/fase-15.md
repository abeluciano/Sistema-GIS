# Fase 15 - Evidencia fotografica de extremo a extremo

## Objetivo

Completar la evidencia fotografica del reporte ciudadano desde la captura en el
dispositivo hasta su almacenamiento, consulta y administracion en el dashboard.

## Aplicacion movil

- La fotografia capturada se conserva como objeto `Photo` de Capacitor.
- Al crear el reporte, la app convierte la URI local en `Blob` y envia un
  `multipart/form-data` autenticado con Firebase.
- La evidencia se asocia al identificador real devuelto por `POST /reportes`.
- Si el reporte se crea y solo falla la fotografia, la app evita duplicarlo y
  presenta la accion `Reintentar fotografia`.
- El formulario indica claramente cuando la fotografia esta lista y bloquea
  envios repetidos mientras procesa la solicitud.

## Backend

- Se corrigio la raiz local de almacenamiento a `backend/uploads`.
- Se validan extensiones y MIME JPEG, PNG y WebP.
- La descarga administrativa verifica que la ruta permanezca dentro de la
  carpeta autorizada.
- La eliminacion borra el registro, el archivo fisico y agrega una entrada al
  historial del reporte.
- Scalar/OpenAPI documenta listado, carga, descarga y eliminacion.

## Dashboard

- El detalle del reporte carga las evidencias con sesion administrativa.
- Las fotografias se muestran en una galeria adaptable.
- El gestor o administrador puede eliminar evidencia desde el detalle.
- Los recursos temporales del navegador se liberan al cerrar el dialogo.

## Verificacion

| Componente | Verificacion | Resultado |
|---|---|---|
| Backend | Jest | 15/15 aprobadas |
| Aplicacion movil | Vitest, incluido envio multipart | 18/18 aprobadas |
| Dashboard | Vitest, incluida galeria y eliminacion | 11/11 aprobadas |
| Aplicacion movil | Build Vite | Correcto |
| Dashboard | Build Vite | Correcto |
| Android | `assembleDebug` | Correcto |
| Dispositivo | Instalacion ADB en `ACXY6R4920002167` | Correcto |
| API local | `/health` despues del reinicio | Correcto |
| API de fotos | Listado autenticado del reporte 43 | Correcto, 0 fotos existentes |

Total automatizado conservado: **44/44 casos aprobados**.

La comprobacion con una fotografia real requiere que el ciudadano capture y envie
una nueva evidencia desde el telefono. No se genero evidencia ficticia ni se
modificaron reportes ciudadanos existentes para simular este resultado.

## Trazabilidad con la tesis

Esta fase completa el metadato de evidencia fotografica exigido por el primer
objetivo especifico y mejora el control de calidad mediante autorizacion,
validacion de formato, historial administrativo y manejo explicito de fallos.
