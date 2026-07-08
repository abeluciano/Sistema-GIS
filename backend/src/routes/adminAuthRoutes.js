import { Router } from "express";
import { login, logout, me } from "../controllers/adminAuthController.js";
import { authenticateAdmin } from "../middlewares/authAdmin.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { adminLoginSchema } from "../validators/adminSchemas.js";

export const adminAuthRoutes = Router();

adminAuthRoutes.post("/admin/login", validate(adminLoginSchema), asyncHandler(login));
adminAuthRoutes.get("/admin/me", authenticateAdmin, me);
adminAuthRoutes.post("/admin/logout", logout);
