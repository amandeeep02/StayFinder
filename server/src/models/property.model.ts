import mongoose, { Schema, Document } from "mongoose";
import { IProperty } from "../interfaces/property.interface";

export interface IPropertyDocument extends IProperty, Document {
    _id: string;
    fullAddress: string;
}

const locationSchema = new Schema({
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
    },
    zipCode: {
        type: String,
        required: [true, "Zip code is required"],
        trim: true,
    },
    coordinates: {
        latitude: {
            type: Number,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180,
        },
    },
});

const amenitySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        default: null,
    },
    category: {
        type: String,
        enum: ["basic", "entertainment", "safety", "accessibility", "outdoor"],
        required: true,
    },
});

const propertySchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Property title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Property description is required"],
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },
        propertyType: {
            type: String,
            enum: [
                "apartment",
                "house",
                "condo",
                "villa",
                "studio",
                "loft",
                "townhouse",
            ],
            required: [true, "Property type is required"],
        },
        location: {
            type: locationSchema,
            required: [true, "Location is required"],
        },
        pricePerNight: {
            type: Number,
            required: [true, "Price per night is required"],
            min: [0, "Price cannot be negative"],
        },
        maxGuests: {
            type: Number,
            required: [true, "Maximum guests is required"],
            min: [1, "Property must accommodate at least 1 guest"],
            max: [50, "Maximum guests cannot exceed 50"],
        },
        bedrooms: {
            type: Number,
            required: [true, "Number of bedrooms is required"],
            min: [0, "Bedrooms cannot be negative"],
            max: [20, "Bedrooms cannot exceed 20"],
        },
        bathrooms: {
            type: Number,
            required: [true, "Number of bathrooms is required"],
            min: [0.5, "Bathrooms must be at least 0.5"],
            max: [20, "Bathrooms cannot exceed 20"],
        },
        images: [
            {
                type: String,
                required: true,
                validate: {
                    validator: function (v: string) {
                        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(
                            v
                        );
                    },
                    message: "Invalid image URL format",
                },
            },
        ],
        amenities: [amenitySchema],
        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Host is required"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0,
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

// Indexes for better search performance
propertySchema.index({ "location.city": 1 });
propertySchema.index({ "location.state": 1 });
propertySchema.index({ "location.country": 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ pricePerNight: 1 });
propertySchema.index({ maxGuests: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ bathrooms: 1 });
propertySchema.index({ host: 1 });
propertySchema.index({ isActive: 1 });
propertySchema.index({ isVerified: 1 });
propertySchema.index({ averageRating: -1 });
propertySchema.index({ createdAt: -1 });

// Compound indexes
propertySchema.index({ "location.city": 1, propertyType: 1, pricePerNight: 1 });
propertySchema.index({ isActive: 1, isVerified: 1, averageRating: -1 });

// Text index for search
propertySchema.index({
    title: "text",
    description: "text",
    "location.address": "text",
    "location.city": "text",
    "location.state": "text",
});

// Pre-save middleware
propertySchema.pre("save", function (this: IPropertyDocument, next) {
    if (this.images.length === 0) {
        this.invalidate("images", "At least one image is required");
    }
    next();
});

// Virtual for full address
propertySchema.virtual("fullAddress").get(function (this: IPropertyDocument) {
    return `${this.location.address}, ${this.location.city}, ${this.location.state}, ${this.location.country}`;
});

export const Property = mongoose.model<IPropertyDocument>(
    "Property",
    propertySchema
);
