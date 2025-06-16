import { body, validationResult } from "express-validator";
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

export const validateCreateHostProfile = [
    body("businessName")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Business name cannot exceed 100 characters"),

    body("yearsOfExperience")
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage("Years of experience must be between 0 and 50"),

    body("languages")
        .isArray({ min: 1 })
        .withMessage("At least one language must be specified"),

    body("languages.*")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Language cannot be empty"),

    body("responseTime")
        .isIn(["within_hour", "within_few_hours", "within_day", "few_days"])
        .withMessage("Invalid response time"),

    body("cancellationPolicy")
        .isIn(["flexible", "moderate", "strict", "super_strict"])
        .withMessage("Invalid cancellation policy"),

    body("instantBooking")
        .isBoolean()
        .withMessage("Instant booking must be a boolean"),

    body("minimumStay")
        .isInt({ min: 1, max: 365 })
        .withMessage("Minimum stay must be between 1 and 365 days"),

    body("maximumStay")
        .isInt({ min: 1, max: 365 })
        .withMessage("Maximum stay must be between 1 and 365 days"),

    body("checkInTime")
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Check-in time must be in HH:MM format"),

    body("checkOutTime")
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Check-out time must be in HH:MM format"),

    body("houseRules")
        .optional()
        .isArray()
        .withMessage("House rules must be an array"),

    body("houseRules.*")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Each house rule cannot exceed 200 characters"),

    body("hostingStyle")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Hosting style description cannot exceed 1000 characters"),

    // Custom validation for stay duration
    body("maximumStay").custom((value, { req }) => {
        if (value < req.body.minimumStay) {
            throw new Error(
                "Maximum stay must be greater than or equal to minimum stay"
            );
        }
        return true;
    }),

    handleValidationErrors,
];

export const validateUpdateHostProfile = [
    body("businessName")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Business name cannot exceed 100 characters"),

    body("yearsOfExperience")
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage("Years of experience must be between 0 and 50"),

    body("languages")
        .optional()
        .isArray({ min: 1 })
        .withMessage("At least one language must be specified"),

    body("languages.*")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Language cannot be empty"),

    body("responseTime")
        .optional()
        .isIn(["within_hour", "within_few_hours", "within_day", "few_days"])
        .withMessage("Invalid response time"),

    body("cancellationPolicy")
        .optional()
        .isIn(["flexible", "moderate", "strict", "super_strict"])
        .withMessage("Invalid cancellation policy"),

    body("instantBooking")
        .optional()
        .isBoolean()
        .withMessage("Instant booking must be a boolean"),

    body("minimumStay")
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage("Minimum stay must be between 1 and 365 days"),

    body("maximumStay")
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage("Maximum stay must be between 1 and 365 days"),

    body("checkInTime")
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Check-in time must be in HH:MM format"),

    body("checkOutTime")
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Check-out time must be in HH:MM format"),

    body("houseRules")
        .optional()
        .isArray()
        .withMessage("House rules must be an array"),

    body("houseRules.*")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Each house rule cannot exceed 200 characters"),

    body("hostingStyle")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Hosting style description cannot exceed 1000 characters"),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),

    handleValidationErrors,
];

export const validateHostVerification = [
    body("type")
        .isIn([
            "email",
            "phone",
            "identity",
            "business_license",
            "tax_documents",
        ])
        .withMessage("Invalid verification type"),

    body("documents")
        .optional()
        .isArray()
        .withMessage("Documents must be an array"),

    body("documents.*")
        .optional()
        .isURL()
        .withMessage("Each document must be a valid URL"),

    body("notes")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Notes cannot exceed 500 characters"),

    handleValidationErrors,
];
