# Seguridad y operacion

## Secretos

- No versionar `.env`, `.env.local`, `google-services.json`, cuentas de servicio ni llaves privadas.
- Usar `.env.example` solo como plantilla.
- Ejecutar auditoria local antes de entregar o commitear:

```bash
npm run security:audit
```

## Rate limiting

Variables disponibles:

- `RATE_LIMIT_WINDOW_MS`: ventana general en milisegundos.
- `RATE_LIMIT_MAX`: maximo de solicitudes por ventana.
- `AUTH_RATE_LIMIT_MAX`: maximo de intentos de autenticacion por ventana.

El endpoint `POST /admin/login` usa limite especifico y omite intentos exitosos para reducir bloqueo accidental.

## Trazabilidad

Cada solicitud recibe `X-Request-Id`. En entornos distintos de test, el backend registra ese identificador en logs.

## Uploads

La limpieza de fotografias huerfanas se ejecuta en modo simulacion por defecto:

```bash
npm run uploads:cleanup -w backend
```

Para aplicar eliminacion:

```bash
npm run uploads:cleanup -w backend -- --apply
```

Solo se consideran archivos dentro de `UPLOADS_DIR`, no registrados en `reporte_fotos` y con antiguedad mayor a `UPLOAD_ORPHAN_RETENTION_DAYS`.

## Carga humo

Con el backend levantado:

```bash
npm run load:smoke
```

Variables opcionales:

- `LOAD_TARGET_URL`
- `LOAD_REQUESTS`
- `LOAD_CONCURRENCY`
