import mongoose, { Schema, Document } from "mongoose";
import { IBooking } from "../interfaces/booking.interface";

export interface IBookingDocument extends IBooking, Document {
    _id: string;
    calculateRefund(): number;
    canBeCancelled(): boolean;
    isUpcoming(): boolean;
}

const guestDetailsSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "Guest first name is required"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Guest last name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Guest email is required"],
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "Guest phone is required"],
        trim: true,
    },
    adults: {
        type: Number,
        required: true,
        min: [1, "At least one adult is required"],
    },
    children: {
        type: Number,
        default: 0,
        min: 0,
    },
    infants: {
        type: Number,
        default: 0,
        min: 0,
    },
});

const bookingSchema = new Schema(
    {
        guest: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Guest is required"],
        },
        property: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: [true, "Property is required"],
        },
        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Host is required"],
        },
        checkInDate: {
            type: Date,
            required: [true, "Check-in date is required"],
        },
        checkOutDate: {
            type: Date,
            required: [true, "Check-out date is required"],
        },
        numberOfGuests: {
            type: Number,
            required: [true, "Number of guests is required"],
            min: [1, "At least one guest is required"],
        },
        totalNights: {
            type: Number,
            required: true,
            min: [1, "Minimum one night stay required"],
        },
        pricePerNight: {
            type: Number,
            required: [true, "Price per night is required"],
            min: [0, "Price cannot be negative"],
        },
        subtotal: {
            type: Number,
            required: [true, "Subtotal is required"],
            min: [0, "Subtotal cannot be negative"],
        },
        serviceFee: {
            type: Number,
            required: [true, "Service fee is required"],
            min: [0, "Service fee cannot be negative"],
        },
        taxes: {
            type: Number,
            required: [true, "Taxes amount is required"],
            min: [0, "Taxes cannot be negative"],
        },
        totalAmount: {
            type: Number,
            required: [true, "Total amount is required"],
            min: [0, "Total amount cannot be negative"],
        },
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "cancelled",
                "completed",
                "rejected",
            ],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "refunded", "failed"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            trim: true,
        },
        paymentIntentId: {
            type: String,
            trim: true,
        },
        specialRequests: {
            type: String,
            trim: true,
            maxlength: [1000, "Special requests cannot exceed 1000 characters"],
        },
        guestDetails: {
            type: guestDetailsSchema,
            required: [true, "Guest details are required"],
        },
        cancellationReason: {
            type: String,
            trim: true,
            maxlength: [
                500,
                "Cancellation reason cannot exceed 500 characters",
            ],
        },
        cancellationDate: {
            type: Date,
        },
        cancellationPolicy: {
            type: String,
            enum: ["flexible", "moderate", "strict", "super_strict"],
            required: true,
        },
        refundAmount: {
            type: Number,
            min: [0, "Refund amount cannot be negative"],
        },
        checkInInstructions: {
            type: String,
            trim: true,
            maxlength: [
                2000,
                "Check-in instructions cannot exceed 2000 characters",
            ],
        },
        reviewByGuest: {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
        reviewByHost: {
            type: Schema.Types.ObjectId,
            ref: "Review",
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
bookingSchema.index({ guest: 1 });
bookingSchema.index({ property: 1 });
bookingSchema.index({ host: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ checkInDate: 1 });
bookingSchema.index({ checkOutDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes
bookingSchema.index({ property: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1, checkInDate: 1 });
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });

// Pre-save middleware
bookingSchema.pre("save", function (next) {
    // Validate dates
    if (this.checkOutDate <= this.checkInDate) {
        this.invalidate(
            "checkOutDate",
            "Check-out date must be after check-in date"
        );
    }

    // Calculate total nights
    const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    this.totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Validate guest count
    const totalGuests = this.guestDetails.adults + this.guestDetails.children;
    if (totalGuests !== this.numberOfGuests) {
        this.numberOfGuests = totalGuests;
    }

    next();
});

// Instance methods
bookingSchema.methods.calculateRefund = function (): number {
    const now = new Date();
    const checkInDate = new Date(this.checkInDate);
    const daysUntilCheckIn = Math.ceil(
        (checkInDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    let refundPercentage = 0;

    switch (this.cancellationPolicy) {
        case "flexible":
            if (daysUntilCheckIn >= 1) refundPercentage = 100;
            break;
        case "moderate":
            if (daysUntilCheckIn >= 5) refundPercentage = 100;
            else if (daysUntilCheckIn >= 1) refundPercentage = 50;
            break;
        case "strict":
            if (daysUntilCheckIn >= 7) refundPercentage = 100;
            else if (daysUntilCheckIn >= 1) refundPercentage = 50;
            break;
        case "super_strict":
            if (daysUntilCheckIn >= 14) refundPercentage = 100;
            else if (daysUntilCheckIn >= 7) refundPercentage = 50;
            break;
    }

    return (
        Math.round(((this.totalAmount * refundPercentage) / 100) * 100) / 100
    );
};

bookingSchema.methods.canBeCancelled = function (): boolean {
    const now = new Date();
    const checkInDate = new Date(this.checkInDate);

    return (
        this.status !== "cancelled" &&
        this.status !== "completed" &&
        checkInDate > now
    );
};

bookingSchema.methods.isUpcoming = function (): boolean {
    const now = new Date();
    const checkInDate = new Date(this.checkInDate);
    const checkOutDate = new Date(this.checkOutDate);

    return checkInDate > now || (checkInDate <= now && checkOutDate > now);
};

export const Booking = mongoose.model<IBookingDocument>(
    "Booking",
    bookingSchema
);
