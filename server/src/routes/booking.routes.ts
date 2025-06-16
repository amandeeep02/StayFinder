import express from "express";
import {
    createBooking,
    getBookingById,
    getUserBookings,
    getHostBookings,
    updateBookingStatus,
    checkAvailability,
    calculatePrice,
    getBookingStats,
    getAllBookings,
} from "../controllers/booking.controller";
import {
    authCheck,
    requireHost,
    requireAdmin,
} from "../middleware/auth.middleware";
import {
    validateCreateBooking,
    validateUpdateBooking,
    validateBookingSearch,
    validateAvailabilityCheck,
} from "../middleware/booking-validation.middleware";

const router = express.Router();

// Public routes
router.get("/availability", validateAvailabilityCheck, checkAvailability);
router.get("/calculate-price", calculatePrice);

// Protected routes (authenticated users)
router.post("/create", authCheck, validateCreateBooking, createBooking);
router.get("/my-bookings", authCheck, getUserBookings);
router.get("/stats", authCheck, getBookingStats);
router.get("/:id", authCheck, getBookingById);
router.patch("/:id", authCheck, validateUpdateBooking, updateBookingStatus);

// Host routes
router.get("/host/bookings", authCheck, requireHost, getHostBookings);

// Admin routes
router.get(
    "/admin/all",
    authCheck,
    requireAdmin,
    validateBookingSearch,
    getAllBookings
);

export default router;
