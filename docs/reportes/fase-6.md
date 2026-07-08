# Reporte de Fase 6 - Dashboard web administrativo

## Entregables

- Dashboard web React + Vite para gestores y administradores.
- Login administrativo contra `POST /admin/login` con JWT guardado localmente.
- Validacion de sesion contra `GET /admin/me`.
- Vista operativa con:
  - filtros por estado, categoria, zona, urgencia y fechas;
  - KPIs principales;
  - mapa GIS con GeoJSON de reportes y zonas;
  - puntos agregados tipo calor operativo;
  - tabla de reportes;
  - acciones rapidas para validar o marcar reportes como atendidos.
- Indicadores visuales:
  - reportes por categoria;
  - reportes por zona;
  - volumen por periodo.
- Seccion `Analisis estadistico` para gestores:
  - opciones formuladas como preguntas de gestion;
  - seleccion interna de endpoint/prueba estadistica;
  - resultado numerico;
  - p-value;
  - interpretacion simple;
  - advertencia de no causalidad;
  - detalle metodologico con la prueba utilizada;
  - exportacion CSV del resultado.
- Configuracion Firebase Web para dashboard mediante variables `VITE_FIREBASE_*`, sin credenciales reales versionadas.
- Prueba automatizada del panel estadistico para verificar experiencia basada en preguntas y no en nombres tecnicos.

## Alcance administrativo

- El modulo de analisis estadistico queda disponible solo en el dashboard administrativo.
- La app movil ciudadana no expone indicadores ni analisis estadistico.
- El dashboard consume los endpoints existentes del backend y respeta la autorizacion por rol `gestor` o `administrador`.

## Validaciones ejecutadas

- `npm run build -w dashboard`: correcto.
- `npm test -w dashboard`: 1 test correcto.
- `npm test -w backend`: 11 tests correctos.
- `npm test -w mobile`: 1 test correcto.
- `npm run check:structure`: correcto.

## Observaciones

- El build de dashboard advierte que el bundle principal supera 500 kB por Leaflet, Firebase, Recharts y React; no bloquea la fase.
- La exportacion CSV de reportes se ejecuta con `Authorization: Bearer <token>`.
- El dashboard no incluye modelos predictivos ni machine learning; el analisis implementado es estadistico exploratorio y de apoyo a decisiones.
