import express from "express";
import {
    uploadSingle,
    uploadMultiple,
    deleteImage,
    getImageUrl,
} from "../controllers/upload.controller";
import { authCheck } from "../middleware/auth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = express.Router();

// Protected routes (require authentication)
router.post(
    "/image",
    authCheck,
    uploadMiddleware.single("image"),
    uploadSingle
);

router.post(
    "/multiple",
    authCheck,
    uploadMiddleware.array("images", 10),
    uploadMultiple
);

router.delete("/image/:filename", authCheck, deleteImage);

// Public route for getting images
router.get("/image/:filename", getImageUrl);

export default router;
