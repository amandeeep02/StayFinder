import { body, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: "Validation failed",
            details: errors.array(),
        });
        return;
    }
    next();
};

export const validateCreateBooking = [
    body("propertyId").isMongoId().withMessage("Valid property ID is required"),

    body("checkInDate")
        .isISO8601()
        .toDate()
        .withMessage("Valid check-in date is required"),

    body("checkOutDate")
        .isISO8601()
        .toDate()
        .withMessage("Valid check-out date is required"),

    body("numberOfGuests")
        .isInt({ min: 1, max: 50 })
        .withMessage("Number of guests must be between 1 and 50"),

    body("guestDetails.firstName")
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage(
            "Guest first name is required and cannot exceed 50 characters"
        ),

    body("guestDetails.lastName")
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage(
            "Guest last name is required and cannot exceed 50 characters"
        ),

    body("guestDetails.email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Valid guest email is required"),

    body("guestDetails.phone")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Guest phone number is required"),

    body("guestDetails.adults")
        .isInt({ min: 1, max: 50 })
        .withMessage("At least one adult is required"),

    body("guestDetails.children")
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage("Children count must be a non-negative number"),

    body("guestDetails.infants")
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage("Infants count must be a non-negative number"),

    body("specialRequests")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Special requests cannot exceed 1000 characters"),

    // Custom validation for date range
    body("checkOutDate").custom((value, { req }) => {
        const checkInDate = new Date(req.body.checkInDate);
        const checkOutDate = new Date(value);

        if (checkOutDate <= checkInDate) {
            throw new Error("Check-out date must be after check-in date");
        }

        // Check if check-in date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            throw new Error("Check-in date cannot be in the past");
        }

        return true;
    }),

    // Custom validation for guest count
    body("numberOfGuests").custom((value, { req }) => {
        const adults = req.body.guestDetails?.adults || 0;
        const children = req.body.guestDetails?.children || 0;

        if (value !== adults + children) {
            throw new Error("Number of guests must equal adults + children");
        }

        return true;
    }),

    handleValidationErrors,
];

export const validateUpdateBooking = [
    body("status")
        .optional()
        .isIn(["confirmed", "cancelled", "rejected"])
        .withMessage("Invalid booking status"),

    body("checkInInstructions")
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Check-in instructions cannot exceed 2000 characters"),

    body("cancellationReason")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Cancellation reason cannot exceed 500 characters"),

    handleValidationErrors,
];

export const validateBookingSearch = [
    query("status")
        .optional()
        .isIn(["pending", "confirmed", "cancelled", "completed", "rejected"])
        .withMessage("Invalid booking status"),

    query("paymentStatus")
        .optional()
        .isIn(["pending", "paid", "refunded", "failed"])
        .withMessage("Invalid payment status"),

    query("dateFrom")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format for dateFrom"),

    query("dateTo")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format for dateTo"),

    query("propertyId")
        .optional()
        .isMongoId()
        .withMessage("Invalid property ID"),

    query("guestId").optional().isMongoId().withMessage("Invalid guest ID"),

    query("hostId").optional().isMongoId().withMessage("Invalid host ID"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be at least 1"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("sortBy")
        .optional()
        .isIn(["createdAt", "checkInDate", "totalAmount"])
        .withMessage("Invalid sort field"),

    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc"),

    handleValidationErrors,
];

export const validateAvailabilityCheck = [
    query("propertyId")
        .isMongoId()
        .withMessage("Valid property ID is required"),

    query("checkInDate")
        .isISO8601()
        .withMessage("Valid check-in date is required"),

    query("checkOutDate")
        .isISO8601()
        .withMessage("Valid check-out date is required"),

    query("excludeBookingId")
        .optional()
        .isMongoId()
        .withMessage("Invalid booking ID to exclude"),

    handleValidationErrors,
];
