import { Router } from "express";
import { firebaseProfile } from "../controllers/firebaseAuthController.js";
import { authenticateFirebase } from "../middlewares/authFirebase.js";

export const firebaseAuthRoutes = Router();

firebaseAuthRoutes.get("/auth/firebase/profile", authenticateFirebase, firebaseProfile);
