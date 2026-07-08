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
    { name: "Firebase Auth" }
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
    }
  }
};
