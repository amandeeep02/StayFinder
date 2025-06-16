export interface Property {
    _id: string;
    title: string;
    description: string;
    pricePerNight: number;
    location: {
        city: string;
        country: string;
        address: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    images: string[];
    amenities: string[];
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    propertyType: "apartment" | "house" | "villa" | "studio" | "loft";
    host: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    rating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PropertyFilters {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    propertyType?: string;
    amenities?: string[];
}

export interface PropertyFormData {
    title: string;
    description: string;
    pricePerNight: number; // Changed from 'price' to 'pricePerNight'
    location: {
        city: string;
        state: string; // Added state field
        country: string;
        address: string;
        zipCode: string; // Added zipCode field
    };
    images: string[];
    amenities: string[];
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    propertyType: "apartment" | "house" | "villa" | "studio" | "loft";
    rules?: string[];
    checkInTime: string;
    checkOutTime: string;
    minimumStay: number;
}

export interface PropertyStats {
    views: number;
    bookings: number;
    revenue: number;
    occupancyRate: number;
    averageRating: number;
    lastMonthRevenue: number;
    bookingTrend: "up" | "down" | "stable";
}
