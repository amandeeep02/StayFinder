export interface CreateReviewData {
    propertyId: string;
    bookingId: string;
    rating: number;
    comment: string;
}

export interface UpdateReviewData {
    rating: number;
    comment: string;
}

export interface ReviewFilters {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "rejected";
    rating?: number;
    sortBy?: "createdAt" | "rating" | "updatedAt";
    sortOrder?: "asc" | "desc";
}

export interface ReviewReport {
    reportedBy: string;
    reason: string;
    reportedAt: Date;
}
