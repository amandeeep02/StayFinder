import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
    property: mongoose.Types.ObjectId;
    guest: mongoose.Types.ObjectId;
    booking: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    status: "pending" | "approved" | "rejected";
    reports: {
        reportedBy: mongoose.Types.ObjectId;
        reason: string;
        reportedAt: Date;
    }[];
    moderationNote?: string;
    moderatedBy?: mongoose.Types.ObjectId;
    moderatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        property: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },
        guest: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        booking: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        reports: [
            {
                reportedBy: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                reason: {
                    type: String,
                    required: true,
                },
                reportedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        moderationNote: {
            type: String,
            trim: true,
        },
        moderatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        moderatedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ReviewSchema.index({ property: 1, guest: 1 });
ReviewSchema.index({ booking: 1, guest: 1 }, { unique: true });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ rating: 1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
