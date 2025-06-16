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

export const validateCreateUser = [
    body("firstName")
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("First name must be between 1 and 50 characters"),

    body("lastName")
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("Last name must be between 1 and 50 characters"),

    body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email address"),

    body("role")
        .isIn(["user", "host", "admin"])
        .withMessage("Role must be user, host, or admin"),

    body("phone")
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage("Please provide a valid phone number"),

    body("bio")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Bio cannot exceed 500 characters"),

    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),

    handleValidationErrors,
];

export const validateUpdateUser = [
    body("firstName")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("First name must be between 1 and 50 characters"),

    body("lastName")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("Last name must be between 1 and 50 characters"),

    body("phone")
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage("Please provide a valid phone number"),

    body("bio")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Bio cannot exceed 500 characters"),

    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),

    handleValidationErrors,
];
