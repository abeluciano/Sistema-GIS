import { loginAdmin } from "../services/adminAuthService.js";

export async function login(req, res) {
  const result = await loginAdmin(req.body, req.app.locals.repositories);

  res.cookie("admin_token", result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000
  });

  res.json(result);
}

export function me(req, res) {
  res.json({ user: req.admin });
}

export function logout(_req, res) {
  res.clearCookie("admin_token");
  res.status(204).send();
}
