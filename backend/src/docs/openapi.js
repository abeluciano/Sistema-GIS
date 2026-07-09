export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Sistema GIS de Reportes Ciudadanos API",
    version: "0.1.0",
    description: "API REST para reportes ciudadanos georreferenciados, dashboard administrativo, GIS e indicadores."
  },
  servers: [{ url: "http://localhost:4000" }],
  tags: [
    { name: "Health" },
    { name: "Dashboard Auth" },
    { name: "Firebase Auth" },
    { name: "Usuarios" },
    { name: "Catalogos" },
    { name: "Reportes" },
    { name: "Fotos" },
    { name: "Indicadores" },
    { name: "GIS" },
    { name: "Estadistica" },
    { name: "Exportacion" }
  ],
  components: {
    securitySchemes: {
      FirebaseBearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Firebase ID Token"
      },
      AdminBearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica el estado basico del backend.",
        responses: {
          "200": { description: "Backend operativo." }
        }
      }
    },
    "/admin/login": {
      post: {
        tags: ["Dashboard Auth"],
        summary: "Inicia sesion administrativa interna.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["usuario", "password"],
                properties: {
                  usuario: { type: "string", example: "admin" },
                  password: { type: "string", example: "admin" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Sesion iniciada." },
          "401": { description: "Credenciales invalidas." }
        }
      }
    },
    "/admin/me": {
      get: {
        tags: ["Dashboard Auth"],
        security: [{ AdminBearer: [] }],
        summary: "Obtiene el usuario administrativo autenticado.",
        responses: {
          "200": { description: "Usuario autenticado." },
          "401": { description: "Sesion requerida." }
        }
      }
    },
    "/admin/logout": {
      post: {
        tags: ["Dashboard Auth"],
        summary: "Cierra sesion administrativa.",
        responses: {
          "204": { description: "Sesion cerrada." }
        }
      }
    },
    "/auth/firebase/profile": {
      get: {
        tags: ["Firebase Auth"],
        security: [{ FirebaseBearer: [] }],
        summary: "Verifica un token Firebase y devuelve datos basicos.",
        responses: {
          "200": { description: "Token valido." },
          "401": { description: "Token invalido." }
        }
      }
    },
    "/auth/firebase/sync": {
      post: {
        tags: ["Firebase Auth"],
        security: [{ FirebaseBearer: [] }],
        summary: "Sincroniza o crea el perfil ciudadano desde Firebase.",
        responses: { "201": { description: "Perfil sincronizado." } }
      }
    },
    "/me": {
      get: {
        tags: ["Firebase Auth"],
        security: [{ FirebaseBearer: [] }],
        summary: "Obtiene el perfil ciudadano sincronizado.",
        responses: { "200": { description: "Perfil ciudadano." } }
      }
    },
    "/usuarios": {
      get: {
        tags: ["Usuarios"],
        security: [{ AdminBearer: [] }],
        summary: "Lista usuarios para dashboard."
      }
    },
    "/usuarios/{id}": {
      get: { tags: ["Usuarios"], security: [{ AdminBearer: [] }], summary: "Obtiene usuario por ID." }
    },
    "/usuarios/{id}/rol": {
      patch: { tags: ["Usuarios"], security: [{ AdminBearer: [] }], summary: "Actualiza rol de usuario." }
    },
    "/usuarios/{id}/estado": {
      patch: { tags: ["Usuarios"], security: [{ AdminBearer: [] }], summary: "Activa o desactiva usuario." }
    },
    "/categorias": {
      get: { tags: ["Catalogos"], summary: "Lista categorias." },
      post: { tags: ["Catalogos"], security: [{ AdminBearer: [] }], summary: "Crea categoria." }
    },
    "/categorias/{id}": {
      put: { tags: ["Catalogos"], security: [{ AdminBearer: [] }], summary: "Actualiza categoria." }
    },
    "/zonas": {
      get: { tags: ["Catalogos"], summary: "Lista zonas." },
      post: { tags: ["Catalogos"], security: [{ AdminBearer: [] }], summary: "Crea zona." }
    },
    "/zonas/{id}": {
      put: { tags: ["Catalogos"], security: [{ AdminBearer: [] }], summary: "Actualiza zona." }
    },
    "/zonas/reasignar": {
      post: { tags: ["Catalogos"], security: [{ AdminBearer: [] }], summary: "Recalcula la zona de todos los reportes mediante PostGIS." }
    },
    "/reportes": {
      get: { tags: ["Reportes"], security: [{ AdminBearer: [] }], summary: "Lista reportes con filtros." },
      post: { tags: ["Reportes"], security: [{ FirebaseBearer: [] }], summary: "Crea reporte ciudadano georreferenciado." }
    },
    "/mis-reportes": {
      get: { tags: ["Reportes"], security: [{ FirebaseBearer: [] }], summary: "Lista reportes del ciudadano autenticado." }
    },
    "/reportes/{id}": {
      get: { tags: ["Reportes"], security: [{ AdminBearer: [] }], summary: "Obtiene detalle de reporte." }
    },
    "/reportes/{id}/validar": {
      patch: { tags: ["Reportes"], security: [{ AdminBearer: [] }], summary: "Valida reporte." }
    },
    "/reportes/{id}/rechazar": {
      patch: { tags: ["Reportes"], security: [{ AdminBearer: [] }], summary: "Rechaza reporte." }
    },
    "/reportes/{id}/atender": {
      patch: { tags: ["Reportes"], security: [{ AdminBearer: [] }], summary: "Marca reporte como atendido." }
    },
    "/reportes/{id}/archivar": {
      patch: { tags: ["Reportes"], security: [{ AdminBearer: [] }], summary: "Archiva reporte." }
    },
    "/reportes/{id}/fotos": {
      get: { tags: ["Fotos"], security: [{ AdminBearer: [] }], summary: "Lista fotos de reporte." },
      post: { tags: ["Fotos"], security: [{ FirebaseBearer: [] }], summary: "Agrega fotografia al reporte." }
    },
    "/reportes/{id}/fotos/{fotoId}/archivo": {
      get: { tags: ["Fotos"], security: [{ AdminBearer: [] }], summary: "Descarga una fotografia del reporte." }
    },
    "/reportes/{id}/fotos/{fotoId}": {
      delete: { tags: ["Fotos"], security: [{ AdminBearer: [] }], summary: "Elimina una fotografia y registra la accion." }
    },
    "/reportes/{id}/historial": {
      get: { tags: ["Reportes"], security: [{ AdminBearer: [] }], summary: "Lista historial del reporte." }
    },
    "/reportes/{id}/estado": {
      patch: { tags: ["Reportes"], security: [{ AdminBearer: [] }], summary: "Cambia estado de reporte desde dashboard." }
    },
    "/indicadores/resumen": {
      get: { tags: ["Indicadores"], security: [{ AdminBearer: [] }], summary: "KPIs principales." }
    },
    "/indicadores/por-categoria": {
      get: { tags: ["Indicadores"], security: [{ AdminBearer: [] }], summary: "Conteo de reportes por categoria." }
    },
    "/indicadores/por-zona": {
      get: { tags: ["Indicadores"], security: [{ AdminBearer: [] }], summary: "Conteo de reportes por zona." }
    },
    "/indicadores/por-periodo": {
      get: { tags: ["Indicadores"], security: [{ AdminBearer: [] }], summary: "Conteo de reportes por dia o mes." }
    },
    "/gis/reportes.geojson": {
      get: { tags: ["GIS"], security: [{ AdminBearer: [] }], summary: "Reportes en GeoJSON." }
    },
    "/gis/zonas.geojson": {
      get: { tags: ["GIS"], security: [{ AdminBearer: [] }], summary: "Zonas en GeoJSON." }
    },
    "/gis/heatmap": {
      get: { tags: ["GIS"], security: [{ AdminBearer: [] }], summary: "Puntos agregados para mapa de calor." }
    },
    "/gis/concentracion-zonas.geojson": {
      get: { tags: ["GIS"], security: [{ AdminBearer: [] }], summary: "Hotspots y coldspots exploratorios por conteos estandarizados." }
    },
    "/gis/analisis/kde": {
      post: { tags: ["GIS"], security: [{ AdminBearer: [] }], summary: "Registra analisis espacial exploratorio tipo KDE basico." }
    },
    "/analisis/estadistico/chi-cuadrado": {
      get: { tags: ["Estadistica"], security: [{ AdminBearer: [] }], summary: "Asociacion entre variables categoricas." }
    },
    "/analisis/estadistico/mann-whitney": {
      get: { tags: ["Estadistica"], security: [{ AdminBearer: [] }], summary: "Comparacion entre dos grupos independientes." }
    },
    "/analisis/estadistico/kruskal-wallis": {
      get: { tags: ["Estadistica"], security: [{ AdminBearer: [] }], summary: "Comparacion entre tres o mas grupos." }
    },
    "/analisis/estadistico/spearman": {
      get: { tags: ["Estadistica"], security: [{ AdminBearer: [] }], summary: "Relacion entre variables ordinales o no normales." }
    },
    "/analisis/estadistico/wilcoxon": {
      get: { tags: ["Estadistica"], security: [{ AdminBearer: [] }], summary: "Comparacion antes-despues si existen datos pareados suficientes." }
    },
    "/analisis/estadistico/friedman": {
      get: { tags: ["Estadistica"], security: [{ AdminBearer: [] }], summary: "Comparacion de tres o mas mediciones relacionadas si existen datos suficientes." }
    },
    "/export/reportes.csv": {
      get: { tags: ["Exportacion"], security: [{ AdminBearer: [] }], summary: "Exporta reportes en CSV." }
    }
  }
};
