import express from "express";
import userRoutes from "./user.routes";
import propertyRoutes from "./property.routes";
import bookingRoutes from "./booking.routes";
import hostRoutes from "./host.routes";
import authRoutes from "./auth.routes";
// import reviewRoutes from "./review.routes";
import uploadRoutes from "./upload.routes";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
router.use("/bookings", bookingRoutes);
router.use("/host", hostRoutes);
router.use("/auth", authRoutes);
// router.use("/reviews", reviewRoutes);
router.use("/upload", uploadRoutes);

export default router;
