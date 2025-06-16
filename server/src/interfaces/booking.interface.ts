export interface IBooking {
    _id?: string;
    guest: string; // User ID
    property: string; // Property ID
    host: string; // User ID (host)
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    totalNights: number;
    pricePerNight: number;
    subtotal: number;
    serviceFee: number;
    taxes: number;
    totalAmount: number;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected";
    paymentStatus: "pending" | "paid" | "refunded" | "failed";
    paymentMethod?: string;
    paymentIntentId?: string; // For Stripe integration
    specialRequests?: string;
    guestDetails: IGuestDetails;
    cancellationReason?: string;
    cancellationDate?: Date;
    cancellationPolicy: "flexible" | "moderate" | "strict" | "super_strict";
    refundAmount?: number;
    checkInInstructions?: string;
    reviewByGuest?: string; // Review ID
    reviewByHost?: string; // Review ID
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IGuestDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    adults: number;
    children: number;
    infants: number;
}

export interface IBookingResponse
    extends Omit<IBooking, "guest" | "property" | "host"> {
    guest: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    property: {
        _id: string;
        title: string;
        images: string[];
        location: {
            address: string;
            city: string;
            state: string;
            country: string;
        };
    };
    host: {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        phone?: string;
    };
}

export interface ICreateBookingRequest {
    propertyId: string;
    checkInDate: string | Date;
    checkOutDate: string | Date;
    numberOfGuests: number;
    guestDetails: IGuestDetails;
    specialRequests?: string;
    paymentMethod?: string;
}

export interface IUpdateBookingRequest {
    status?: "confirmed" | "cancelled" | "rejected";
    checkInInstructions?: string;
    cancellationReason?: string;
}

export interface IBookingStats {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    occupancyRate: number;
    upcomingCheckIns: number;
    upcomingCheckOuts: number;
}

export interface IBookingSearchQuery {
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    propertyId?: string;
    guestId?: string;
    hostId?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "checkInDate" | "totalAmount";
    sortOrder?: "asc" | "desc";
}

export interface IAvailabilityCheck {
    propertyId: string;
    checkInDate: Date;
    checkOutDate: Date;
    excludeBookingId?: string;
}

export interface IPriceCalculation {
    pricePerNight: number;
    totalNights: number;
    subtotal: number;
    serviceFee: number;
    taxes: number;
    totalAmount: number;
}
