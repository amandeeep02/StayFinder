import express from "express";
import {
    createHostProfile,
    getHostProfile,
    getHostById,
    updateHostProfile,
    getHostDashboard,
    submitHostVerification,
    getAllHosts,
    verifyHost,
    updateSuperhostStatus,
    deleteHostProfile,
} from "../controllers/host.controller";
import {
    authCheck,
    requireHost,
    requireAdmin,
} from "../middleware/auth.middleware";
import {
    validateCreateHostProfile,
    validateUpdateHostProfile,
    validateHostVerification,
} from "../middleware/host-validation.middleware";

const router = express.Router();

// Public routes
router.get("/:id", getHostById);

// Protected routes (authenticated users)
router.post(
    "/profile",
    authCheck,
    validateCreateHostProfile,
    createHostProfile
);
router.get("/profile/me", authCheck, requireHost, getHostProfile);
router.put(
    "/profile",
    authCheck,
    requireHost,
    validateUpdateHostProfile,
    updateHostProfile
);
router.get("/dashboard/stats", authCheck, requireHost, getHostDashboard);
router.post(
    "/verification",
    authCheck,
    requireHost,
    validateHostVerification,
    submitHostVerification
);
router.delete("/profile", authCheck, requireHost, deleteHostProfile);

// Admin only routes
router.get("/all", authCheck, requireAdmin, getAllHosts);
router.patch("/:id/verify", authCheck, requireAdmin, verifyHost);
router.patch("/:id/superhost", authCheck, requireAdmin, updateSuperhostStatus);

export default router;
