// import express from "express";
// import {
//     createReview,
//     getReviewById,
//     getReviewsByProperty,
//     getReviewsByUser,
//     updateReview,
//     deleteReview,
//     getAllReviews,
//     getReviewStats,
//     reportReview,
//     moderateReview,
// } from "../controllers/review.controller";
// import { authCheck, requireAdmin } from "../middleware/auth.middleware";
// import {
//     validateCreateReview,
//     validateUpdateReview,
//     validateReviewSearch,
//     validateReportReview,
//     validateModerateReview,
// } from "../middleware/review-validation.middleware";

// const router = express.Router();

// // Admin routes (should be placed before generic routes to avoid conflicts)
// router.get(
//     "/admin/all",
//     authCheck,
//     requireAdmin,
//     validateReviewSearch,
//     getAllReviews
// );
// router.get("/admin/stats", authCheck, requireAdmin, getReviewStats);
// router.patch(
//     "/:id/moderate",
//     authCheck,
//     requireAdmin,
//     validateModerateReview,
//     moderateReview
// );

// // Public routes
// router.get("/property/:propertyId", getReviewsByProperty);

// // Protected routes (authenticated users)
// router.post("/", authCheck, validateCreateReview, createReview);
// router.get("/user/my-reviews", authCheck, getReviewsByUser);
// router.put("/:id", authCheck, validateUpdateReview, updateReview);
// router.delete("/:id", authCheck, deleteReview);
// router.post("/:id/report", authCheck, validateReportReview, reportReview);

// // This should be last to avoid conflicts with other routes
// router.get("/:id", getReviewById);

// export default router;
