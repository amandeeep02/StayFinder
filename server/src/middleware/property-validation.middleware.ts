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

export const validateCreateProperty = [
    body("title")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Title must be between 1 and 100 characters"),

    body("description")
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters"),

    body("propertyType")
        .isIn([
            "apartment",
            "house",
            "condo",
            "villa",
            "studio",
            "loft",
            "townhouse",
        ])
        .withMessage("Invalid property type"),

    body("location.address")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Address is required"),

    body("location.city")
        .trim()
        .isLength({ min: 1 })
        .withMessage("City is required"),

    body("location.state")
        .trim()
        .isLength({ min: 1 })
        .withMessage("State is required"),

    body("location.country")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Country is required"),

    body("location.zipCode")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Zip code is required"),

    body("location.coordinates.latitude")
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90"),

    body("location.coordinates.longitude")
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180"),

    body("pricePerNight")
        .isFloat({ min: 0 })
        .withMessage("Price per night must be a positive number"),

    body("maxGuests")
        .isInt({ min: 1, max: 50 })
        .withMessage("Maximum guests must be between 1 and 50"),

    body("bedrooms")
        .isInt({ min: 0, max: 20 })
        .withMessage("Bedrooms must be between 0 and 20"),

    body("bathrooms")
        .isFloat({ min: 0.5, max: 20 })
        .withMessage("Bathrooms must be between 0.5 and 20"),

    body("images")
        .isArray({ min: 1 })
        .withMessage("At least one image is required"),

    body("images.*").isURL().withMessage("Each image must be a valid URL"),

    body("amenities")
        .optional()
        .isArray()
        .withMessage("Amenities must be an array"),

    body("amenities.*.name")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Amenity name is required"),

    body("amenities.*.category")
        .optional()
        .isIn(["basic", "entertainment", "safety", "accessibility", "outdoor"])
        .withMessage("Invalid amenity category"),

    handleValidationErrors,
];

export const validateUpdateProperty = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Title must be between 1 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage("Description must be between 10 and 2000 characters"),

    body("propertyType")
        .optional()
        .isIn([
            "apartment",
            "house",
            "condo",
            "villa",
            "studio",
            "loft",
            "townhouse",
        ])
        .withMessage("Invalid property type"),

    body("location.address")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Address cannot be empty"),

    body("location.city")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("City cannot be empty"),

    body("location.state")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("State cannot be empty"),

    body("location.country")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Country cannot be empty"),

    body("location.zipCode")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Zip code cannot be empty"),

    body("pricePerNight")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price per night must be a positive number"),

    body("maxGuests")
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage("Maximum guests must be between 1 and 50"),

    body("bedrooms")
        .optional()
        .isInt({ min: 0, max: 20 })
        .withMessage("Bedrooms must be between 0 and 20"),

    body("bathrooms")
        .optional()
        .isFloat({ min: 0.5, max: 20 })
        .withMessage("Bathrooms must be between 0.5 and 20"),

    body("images")
        .optional()
        .isArray({ min: 1 })
        .withMessage("At least one image is required"),

    body("images.*")
        .optional()
        .isURL()
        .withMessage("Each image must be a valid URL"),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),

    handleValidationErrors,
];

export const validatePropertySearch = [
    query("city")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("City cannot be empty"),

    query("state")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("State cannot be empty"),

    query("country")
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage("Country cannot be empty"),

    query("propertyType")
        .optional()
        .isIn([
            "apartment",
            "house",
            "condo",
            "villa",
            "studio",
            "loft",
            "townhouse",
        ])
        .withMessage("Invalid property type"),

    query("minPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Minimum price must be a positive number"),

    query("maxPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Maximum price must be a positive number"),

    query("maxGuests")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Maximum guests must be at least 1"),

    query("bedrooms")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Bedrooms must be a non-negative integer"),

    query("bathrooms")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Bathrooms must be a non-negative number"),

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
        .isIn(["price", "rating", "newest", "oldest"])
        .withMessage("Invalid sort option"),

    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc"),

    handleValidationErrors,
];
