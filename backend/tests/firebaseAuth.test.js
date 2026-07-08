import request from "supertest";
import { createApp } from "../src/app.js";

describe("firebase auth middleware", () => {
  test("rejects requests without Firebase token", async () => {
    const app = createApp({ firebaseAuth: null });

    await request(app).get("/auth/firebase/profile").expect(401);
  });

  test("accepts a valid injected Firebase auth verifier", async () => {
    const firebaseAuth = {
      async verifyIdToken(token) {
        if (token !== "valid-token") throw new Error("invalid");
        return { uid: "uid-1", email: "ciudadano@example.com", name: "Ciudadano" };
      }
    };
    const app = createApp({ firebaseAuth });

    const response = await request(app)
      .get("/auth/firebase/profile")
      .set("Authorization", "Bearer valid-token")
      .expect(200);

    expect(response.body.firebaseUser.uid).toBe("uid-1");
  });
});
