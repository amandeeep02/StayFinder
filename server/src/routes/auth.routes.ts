import express from "express";
import { firebaseLogin, getCurrentUser } from "../controllers/auth.controller";
import { verifyFirebaseToken, authCheck } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/firebase-login", verifyFirebaseToken, firebaseLogin);
router.get("/current-user", authCheck, getCurrentUser);

export default router;
