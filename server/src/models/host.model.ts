import mongoose, { Schema, Document } from "mongoose";
import { IHostProfile } from "../interfaces/host.interface";

export interface IHostDocument extends IHostProfile, Document {
    _id: string;
    calculateStats(): Promise<any>;
    updateSuperHostStatus(): Promise<boolean>;
}

const hostAchievementSchema = new Schema({
    type: {
        type: String,
        enum: [
            "superhost",
            "new_host",
            "experienced",
            "top_rated",
            "quick_responder",
        ],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    earnedAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const hostVerificationSchema = new Schema({
    type: {
        type: String,
        enum: [
            "email",
            "phone",
            "identity",
            "business_license",
            "tax_documents",
        ],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
    },
    verifiedAt: {
        type: Date,
    },
    documents: [
        {
            type: String, // URLs to uploaded documents
        },
    ],
    notes: {
        type: String,
    },
});

const hostEarningsSchema = new Schema({
    totalEarnings: {
        type: Number,
        default: 0,
        min: 0,
    },
    currentMonthEarnings: {
        type: Number,
        default: 0,
        min: 0,
    },
    lastMonthEarnings: {
        type: Number,
        default: 0,
        min: 0,
    },
    pendingPayouts: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalPayouts: {
        type: Number,
        default: 0,
        min: 0,
    },
    averageNightlyRate: {
        type: Number,
        default: 0,
        min: 0,
    },
    occupancyRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
});

const hostSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            unique: true,
        },
        businessName: {
            type: String,
            trim: true,
            maxlength: [100, "Business name cannot exceed 100 characters"],
        },
        businessLicense: {
            type: String,
            trim: true,
        },
        taxId: {
            type: String,
            trim: true,
        },
        yearsOfExperience: {
            type: Number,
            min: [0, "Years of experience cannot be negative"],
            max: [50, "Years of experience cannot exceed 50"],
        },
        languages: [
            {
                type: String,
                trim: true,
                required: true,
            },
        ],
        responseTime: {
            type: String,
            enum: ["within_hour", "within_few_hours", "within_day", "few_days"],
            default: "within_day",
        },
        responseRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        acceptanceRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        cancellationPolicy: {
            type: String,
            enum: ["flexible", "moderate", "strict", "super_strict"],
            default: "moderate",
        },
        instantBooking: {
            type: Boolean,
            default: false,
        },
        minimumStay: {
            type: Number,
            default: 1,
            min: [1, "Minimum stay must be at least 1 day"],
            max: [365, "Minimum stay cannot exceed 365 days"],
        },
        maximumStay: {
            type: Number,
            default: 30,
            min: [1, "Maximum stay must be at least 1 day"],
            max: [365, "Maximum stay cannot exceed 365 days"],
        },
        checkInTime: {
            type: String,
            required: [true, "Check-in time is required"],
            match: [
                /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                "Invalid time format (HH:MM)",
            ],
        },
        checkOutTime: {
            type: String,
            required: [true, "Check-out time is required"],
            match: [
                /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                "Invalid time format (HH:MM)",
            ],
        },
        houseRules: [
            {
                type: String,
                trim: true,
                maxlength: [
                    200,
                    "Each house rule cannot exceed 200 characters",
                ],
            },
        ],
        hostingStyle: {
            type: String,
            trim: true,
            maxlength: [
                1000,
                "Hosting style description cannot exceed 1000 characters",
            ],
        },
        achievements: [hostAchievementSchema],
        verifications: [hostVerificationSchema],
        earnings: {
            type: hostEarningsSchema,
            default: () => ({}),
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isSuperhost: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Indexes
hostSchema.index({ user: 1 });
hostSchema.index({ isActive: 1 });
hostSchema.index({ isSuperhost: 1 });
hostSchema.index({ responseRate: -1 });
hostSchema.index({ acceptanceRate: -1 });
hostSchema.index({ "earnings.totalEarnings": -1 });

// Pre-save middleware
hostSchema.pre("save", function (next) {
    // Ensure maximum stay is greater than minimum stay
    if (this.maximumStay < this.minimumStay) {
        this.maximumStay = this.minimumStay;
    }
    next();
});

// Methods
hostSchema.methods.calculateStats = async function () {
    try {
        // Import models dynamically to avoid circular dependencies
        const Property = mongoose.model("Property");

        const totalProperties = await Property.countDocuments({
            host: this.user,
        });
        const activeProperties = await Property.countDocuments({
            host: this.user,
            isActive: true,
        });

        // Calculate average rating from properties
        const properties = await Property.find({ host: this.user }).select(
            "averageRating totalReviews"
        );

        let totalRating = 0;
        let totalReviews = 0;

        properties.forEach((property) => {
            if (property.totalReviews && property.averageRating) {
                totalRating += property.averageRating * property.totalReviews;
                totalReviews += property.totalReviews;
            }
        });

        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        const stats = {
            totalProperties,
            activeProperties,
            totalBookings: 0, // Will be updated when booking system is implemented
            completedBookings: 0,
            cancelledBookings: 0,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            responseRate: this.responseRate,
            acceptanceRate: this.acceptanceRate,
            joinedDate: this.createdAt,
        };

        return stats;
    } catch (error) {
        console.error("Error calculating host stats:", error);
        return {
            totalProperties: 0,
            activeProperties: 0,
            totalBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            averageRating: 0,
            totalReviews: 0,
            responseRate: this.responseRate,
            acceptanceRate: this.acceptanceRate,
            joinedDate: this.createdAt,
        };
    }
};

hostSchema.methods.updateSuperHostStatus = async function () {
    try {
        // Criteria for superhost status
        const criteria = {
            minimumRating: 4.8,
            minimumReviews: 10,
            minimumResponseRate: 90,
            minimumCompletedTrips: 10,
        };

        const stats = await this.calculateStats();

        if (stats) {
            const wasSuperhost = this.isSuperhost;

            this.isSuperhost =
                stats.averageRating >= criteria.minimumRating &&
                stats.totalReviews >= criteria.minimumReviews &&
                this.responseRate >= criteria.minimumResponseRate &&
                stats.completedBookings >= criteria.minimumCompletedTrips;

            // Update achievements if status changed
            if (this.isSuperhost && !wasSuperhost) {
                // Add superhost achievement
                const superhostAchievement = this.achievements.find(
                    (a: any) => a.type === "superhost"
                );
                if (!superhostAchievement) {
                    this.achievements.push({
                        type: "superhost",
                        title: "Superhost",
                        description: "Recognized for exceptional hosting",
                        earnedAt: new Date(),
                        isActive: true,
                    });
                } else {
                    superhostAchievement.isActive = true;
                }
            } else if (!this.isSuperhost && wasSuperhost) {
                // Deactivate superhost achievement
                const superhostAchievement = this.achievements.find(
                    (a: any) => a.type === "superhost"
                );
                if (superhostAchievement) {
                    superhostAchievement.isActive = false;
                }
            }
        }

        return this.isSuperhost;
    } catch (error) {
        console.error("Error updating superhost status:", error);
        return false;
    }
};

export const Host = mongoose.model<IHostDocument>("Host", hostSchema);
