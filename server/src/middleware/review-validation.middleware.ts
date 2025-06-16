import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import Joi from "joi";

const createReviewSchema = Joi.object({
    propertyId: Joi.string().required(),
    bookingId: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(10).max(1000).required(),
});

const updateReviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().min(10).max(1000).optional(),
}).min(1); // At least one field must be provided

const reviewSearchSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid("pending", "approved", "rejected"),
    rating: Joi.number().integer().min(1).max(5),
    sortBy: Joi.string()
        .valid("createdAt", "rating", "updatedAt")
        .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Add new validation schemas
const reportReviewSchema = Joi.object({
    reason: Joi.string().min(5).max(500).required(),
});

const moderateReviewSchema = Joi.object({
    status: Joi.string().valid("approved", "rejected", "pending").required(),
    moderationNote: Joi.string().max(500).optional(),
});

export const validateCreateReview = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const { error } = createReviewSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

export const validateUpdateReview = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const { error } = updateReviewSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

export const validateReviewSearch = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const { error, value } = reviewSearchSchema.validate(req.query);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    req.query = value;
    next();
};

export const validateReportReview = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const { error } = reportReviewSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

export const validateModerateReview = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const { error } = moderateReviewSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
