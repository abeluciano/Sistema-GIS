import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("admin auth", () => {
  const passwordHash = bcrypt.hashSync("admin", 8);
  const userRepository = {
    async findAdminByLogin(login) {
      if (login !== "admin") return null;

      return {
        id: 1,
        email: "admin",
        nombre: "Administrador prototipo",
        rol: "administrador",
        activo: true,
        password_hash: passwordHash
      };
    }
  };

  test("POST /admin/login returns token for valid credentials", async () => {
    const app = createApp({ userRepository, firebaseAuth: null });

    const response = await request(app)
      .post("/admin/login")
      .send({ usuario: "admin", password: "admin" })
      .expect(200);

    expect(response.body.token).toBeDefined();
    expect(response.body.user.rol).toBe("administrador");
  });

  test("POST /admin/login rejects invalid credentials", async () => {
    const app = createApp({ userRepository, firebaseAuth: null });

    await request(app)
      .post("/admin/login")
      .send({ usuario: "admin", password: "bad-password" })
      .expect(401);
  });

  test("GET /admin/me requires an admin token", async () => {
    const app = createApp({ userRepository, firebaseAuth: null });

    await request(app).get("/admin/me").expect(401);
  });
});
