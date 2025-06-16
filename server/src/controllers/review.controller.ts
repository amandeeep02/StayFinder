import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Review } from "../models/Review.model";
import { Property } from "../models/property.model";
import { Booking } from "../models/booking.model";
import mongoose from "mongoose";

export const createReview = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { propertyId, rating, comment, bookingId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Validate required fields
        if (!propertyId || !rating || !comment || !bookingId) {
            return res.status(400).json({
                error: "Property ID, rating, comment, and booking ID are required",
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                error: "Rating must be between 1 and 5",
            });
        }

        // Check if user has a completed booking for this property
        const booking = await Booking.findOne({
            _id: bookingId,
            guest: userId,
            property: propertyId,
            status: "completed",
        });

        if (!booking) {
            return res.status(400).json({
                error: "You can only review properties you have booked and completed",
            });
        }

        // Check if user already reviewed this booking
        const existingReview = await Review.findOne({
            booking: bookingId,
            guest: userId,
        });

        if (existingReview) {
            return res.status(400).json({
                error: "You have already reviewed this booking",
            });
        }

        // Create review
        const review = await Review.create({
            property: propertyId,
            guest: userId,
            booking: bookingId,
            rating: Number(rating),
            comment: comment.trim(),
        });

        // Populate review data
        await review.populate([
            { path: "guest", select: "firstName lastName avatar" },
            { path: "property", select: "title" },
        ]);

        // Update property average rating
        await updatePropertyRating(propertyId);

        res.status(201).json({
            message: "Review created successfully",
            review,
        });
    } catch (error: any) {
        console.error("Error creating review:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getReviewById = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid review ID" });
        }

        const review = await Review.findById(id).populate([
            { path: "guest", select: "firstName lastName avatar" },
            { path: "property", select: "title" },
        ]);

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        res.json(review);
    } catch (error: any) {
        console.error("Error fetching review:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getReviewsByProperty = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { propertyId } = req.params;
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).json({ error: "Invalid property ID" });
        }

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));

        const reviews = await Review.find({
            property: propertyId,
            status: "approved",
        })
            .populate("guest", "firstName lastName avatar")
            .sort({ [sortBy as string]: sortOrder === "desc" ? -1 : 1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const total = await Review.countDocuments({
            property: propertyId,
            status: "approved",
        });

        // Get rating summary
        const ratingStats = await Review.aggregate([
            {
                $match: {
                    property: new mongoose.Types.ObjectId(propertyId),
                    status: "approved",
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    ratingDistribution: {
                        $push: "$rating",
                    },
                },
            },
        ]);

        res.json({
            reviews,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalReviews: total,
                hasMore: pageNum * limitNum < total,
            },
            stats: ratingStats[0] || {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: [],
            },
        });
    } catch (error: any) {
        console.error("Error fetching property reviews:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getReviewsByUser = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 10 } = req.query;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));

        const reviews = await Review.find({ guest: userId })
            .populate("property", "title images location")
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const total = await Review.countDocuments({ guest: userId });

        res.json({
            reviews,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalReviews: total,
                hasMore: pageNum * limitNum < total,
            },
        });
    } catch (error: any) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateReview = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid review ID" });
        }

        // Validate rating range
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                error: "Rating must be between 1 and 5",
            });
        }

        const review = await Review.findOne({ _id: id, guest: userId });

        if (!review) {
            return res
                .status(404)
                .json({ error: "Review not found or unauthorized" });
        }

        // Check if review can be updated (within 24 hours of creation)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (review.createdAt < twentyFourHoursAgo) {
            return res.status(400).json({
                error: "Reviews can only be updated within 24 hours of creation",
            });
        }

        if (rating !== undefined) review.rating = Number(rating);
        if (comment !== undefined) review.comment = comment.trim();
        review.updatedAt = new Date();
        await review.save();

        // Update property average rating
        await updatePropertyRating(review.property);

        await review.populate("guest", "firstName lastName avatar");

        res.json({
            message: "Review updated successfully",
            review,
        });
    } catch (error: any) {
        console.error("Error updating review:", error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteReview = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid review ID" });
        }

        const review = await Review.findOne({ _id: id, guest: userId });

        if (!review) {
            return res
                .status(404)
                .json({ error: "Review not found or unauthorized" });
        }

        const propertyId = review.property;
        await Review.findByIdAndDelete(id);

        // Update property average rating
        await updatePropertyRating(propertyId);

        res.json({ message: "Review deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllReviews = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            rating,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));

        const filter: any = {};
        if (status) filter.status = status;
        if (rating) {
            const ratingNum = Number(rating);
            if (ratingNum >= 1 && ratingNum <= 5) {
                filter.rating = ratingNum;
            }
        }

        const reviews = await Review.find(filter)
            .populate("guest", "firstName lastName email")
            .populate("property", "title")
            .sort({ [sortBy as string]: sortOrder === "desc" ? -1 : 1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const total = await Review.countDocuments(filter);

        res.json({
            reviews,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalReviews: total,
                hasMore: pageNum * limitNum < total,
            },
        });
    } catch (error: any) {
        console.error("Error fetching all reviews:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getReviewStats = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const stats = await Review.aggregate([
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$rating" },
                    approvedReviews: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
                        },
                    },
                    pendingReviews: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
                        },
                    },
                    rejectedReviews: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
                        },
                    },
                },
            },
        ]);

        const ratingDistribution = await Review.aggregate([
            { $match: { status: "approved" } },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: -1 } },
        ]);

        res.json({
            stats: stats[0] || {
                totalReviews: 0,
                averageRating: 0,
                approvedReviews: 0,
                pendingReviews: 0,
                rejectedReviews: 0,
            },
            ratingDistribution,
        });
    } catch (error: any) {
        console.error("Error fetching review stats:", error);
        res.status(500).json({ error: error.message });
    }
};

export const reportReview = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid review ID" });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ error: "Report reason is required" });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Check if user already reported this review
        const existingReport = review.reports?.find(
            (report: any) => report.reportedBy.toString() === userId
        );

        if (existingReport) {
            return res
                .status(400)
                .json({ error: "You have already reported this review" });
        }

        // Add report to review
        if (!review.reports) review.reports = [];
        review.reports.push({
            reportedBy: new mongoose.Types.ObjectId(userId),
            reason: reason.trim(),
            reportedAt: new Date(),
        });

        await review.save();

        res.json({ message: "Review reported successfully" });
    } catch (error: any) {
        console.error("Error reporting review:", error);
        res.status(500).json({ error: error.message });
    }
};

export const moderateReview = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params;
        const { status, moderationNote } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid review ID" });
        }

        if (!status || !["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({
                error: "Valid status is required (approved, rejected, or pending)",
            });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        const previousStatus = review.status;
        review.status = status;
        if (moderationNote) review.moderationNote = moderationNote.trim();
        review.moderatedAt = new Date();
        review.moderatedBy = req.user?.id
            ? new mongoose.Types.ObjectId(req.user.id)
            : undefined;

        await review.save();

        // Update property rating if status changed to/from approved
        if (
            previousStatus !== status &&
            (status === "approved" || previousStatus === "approved")
        ) {
            await updatePropertyRating(review.property);
        }

        res.json({
            message: "Review moderated successfully",
            review,
        });
    } catch (error: any) {
        console.error("Error moderating review:", error);
        res.status(500).json({ error: error.message });
    }
};

// Helper function to update property average rating
const updatePropertyRating = async (propertyId: any) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            console.error("Invalid property ID for rating update:", propertyId);
            return;
        }

        const ratingStats = await Review.aggregate([
            {
                $match: {
                    property: new mongoose.Types.ObjectId(propertyId),
                    status: "approved",
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0 };

        await Property.findByIdAndUpdate(propertyId, {
            averageRating: Math.round(stats.averageRating * 10) / 10,
            reviewCount: stats.totalReviews,
        });
    } catch (error) {
        console.error("Error updating property rating:", error);
    }
};
