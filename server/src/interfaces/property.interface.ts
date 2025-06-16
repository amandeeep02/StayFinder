import { Document } from "mongoose";
import { ILocation, IAmenity } from "./host.interface";

export interface IProperty {
    title: string;
    description: string;
    propertyType:
        | "apartment"
        | "house"
        | "condo"
        | "villa"
        | "studio"
        | "loft"
        | "townhouse";
    location: ILocation;
    pricePerNight: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    amenities: IAmenity[];
    host: string; // User ID
    isActive: boolean;
    isVerified: boolean;
    averageRating: number;
    totalReviews: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICreatePropertyRequest {
    title: string;
    description: string;
    propertyType:
        | "apartment"
        | "house"
        | "condo"
        | "villa"
        | "studio"
        | "loft"
        | "townhouse";
    location: ILocation;
    pricePerNight: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    amenities: IAmenity[];
}

export interface IUpdatePropertyRequest {
    title?: string;
    description?: string;
    propertyType?:
        | "apartment"
        | "house"
        | "condo"
        | "villa"
        | "studio"
        | "loft"
        | "townhouse";
    location?: Partial<ILocation>;
    pricePerNight?: number;
    maxGuests?: number;
    bedrooms?: number;
    bathrooms?: number;
    images?: string[];
    amenities?: IAmenity[];
    isActive?: boolean;
}

export interface IPropertySearchQuery {
    city?: string;
    state?: string;
    country?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    maxGuests?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    page?: number;
    limit?: number;
    sortBy?: "price" | "rating" | "newest" | "oldest";
    sortOrder?: "asc" | "desc";
}
