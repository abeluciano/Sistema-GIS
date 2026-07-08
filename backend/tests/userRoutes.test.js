import express from "express";
import request from "supertest";
import { userRoutes } from "../src/routes/userRoutes.js";
import { errorHandler } from "../src/middlewares/errorHandler.js";

describe("user routes", () => {
  test("does not require admin auth for unrelated routes mounted after userRoutes", async () => {
    const app = express();
    app.use(userRoutes);
    app.get("/public-after-users", (_req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    const response = await request(app).get("/public-after-users").expect(200);

    expect(response.body.ok).toBe(true);
  });
});
