import express from "express";
import {
    createProperty,
    getProperties,
    getPropertyById,
    getPropertiesByHost,
    updateProperty,
    deleteProperty,
    togglePropertyStatus,
    verifyProperty,
    searchProperties,
} from "../controllers/property.controller";
import {
    authCheck,
    requireHost,
    requireAdmin,
} from "../middleware/auth.middleware";
import {
    validateCreateProperty,
    validateUpdateProperty,
    validatePropertySearch,
} from "../middleware/property-validation.middleware";

const router = express.Router();

// Public routes
router.get("/", validatePropertySearch, getProperties);
router.get("/search", searchProperties);
router.get("/:id", getPropertyById);

// Protected routes (hosts and admins)
router.post(
    "/create",
    authCheck,
    requireHost,
    validateCreateProperty,
    createProperty
);
router.get("/host/my-properties", authCheck, requireHost, getPropertiesByHost);
router.put(
    "/:id",
    authCheck,
    requireHost,
    validateUpdateProperty,
    updateProperty
);
router.delete("/:id", authCheck, requireHost, deleteProperty);
router.patch(
    "/:id/toggle-status",
    authCheck,
    requireHost,
    togglePropertyStatus
);

// // Admin only routes
router.patch("/:id/verify", authCheck, requireAdmin, verifyProperty);

export default router;
