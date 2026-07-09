import request from "supertest";
import { createApp } from "../src/app.js";

describe("health routes", () => {
  test("GET /health returns service status", async () => {
    const app = createApp({ firebaseAuth: null });

    const response = await request(app).get("/health").expect(200);

    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("sistema-gis-backend");
    expect(response.body.timestamp).toBeDefined();
    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("GET /openapi.json returns the OpenAPI document", async () => {
    const app = createApp({ firebaseAuth: null });

    const response = await request(app).get("/openapi.json").expect(200);

    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths["/health"]).toBeDefined();
    expect(response.body.paths["/zonas/reasignar"]).toBeDefined();
    expect(response.body.paths["/reportes/{id}/fotos/{fotoId}/archivo"]).toBeDefined();
    expect(response.body.paths["/gis/concentracion-zonas.geojson"]).toBeDefined();
    expect(response.body.paths["/gis/unidades-analisis.geojson"]).toBeDefined();
    expect(response.body.paths["/indicadores/comparacion-periodos"]).toBeDefined();
    expect(response.body.paths["/analisis/espacial/moran"]).toBeDefined();
    expect(response.body.paths["/analisis/espacial/moran-local.geojson"]).toBeDefined();
  });
});
