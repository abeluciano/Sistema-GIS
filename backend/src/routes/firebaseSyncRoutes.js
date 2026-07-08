import { Router } from "express";
import { me, syncFirebaseUser } from "../controllers/firebaseSyncController.js";
import { authenticateFirebase } from "../middlewares/authFirebase.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const firebaseSyncRoutes = Router();

firebaseSyncRoutes.post("/auth/firebase/sync", authenticateFirebase, asyncHandler(syncFirebaseUser));
firebaseSyncRoutes.get("/me", authenticateFirebase, asyncHandler(me));
