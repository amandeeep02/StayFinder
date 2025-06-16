export interface ILocation {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface IAmenity {
    name: string;
    icon?: string;
    category:
        | "basic"
        | "entertainment"
        | "safety"
        | "accessibility"
        | "outdoor";
}

export interface IHostAchievement {
    type:
        | "superhost"
        | "new_host"
        | "experienced"
        | "top_rated"
        | "quick_responder";
    title: string;
    description: string;
    earnedAt: Date;
    isActive: boolean;
}

export interface IHostVerification {
    type: "email" | "phone" | "identity" | "business_license" | "tax_documents";
    status: "pending" | "verified" | "rejected";
    verifiedAt?: Date;
    documents?: string[]; // URLs to uploaded documents
    notes?: string;
}

export interface IHostEarnings {
    totalEarnings: number;
    currentMonthEarnings: number;
    lastMonthEarnings: number;
    pendingPayouts: number;
    totalPayouts: number;
    averageNightlyRate: number;
    occupancyRate: number; // Percentage
}

export interface IHostProfile {
    _id?: string;
    user: string; // User ID reference
    businessName?: string;
    businessLicense?: string;
    taxId?: string;
    yearsOfExperience?: number;
    languages: string[];
    responseTime:
        | "within_hour"
        | "within_few_hours"
        | "within_day"
        | "few_days";
    responseRate: number; // Percentage
    acceptanceRate: number; // Percentage
    cancellationPolicy: "flexible" | "moderate" | "strict" | "super_strict";
    instantBooking: boolean;
    minimumStay: number; // Days
    maximumStay: number; // Days
    checkInTime: string; // e.g., "15:00"
    checkOutTime: string; // e.g., "11:00"
    houseRules: string[];
    hostingStyle: string; // Description of hosting approach
    achievements: IHostAchievement[];
    verifications: IHostVerification[];
    earnings: IHostEarnings;
    isActive: boolean;
    isSuperhost: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IHostStats {
    totalProperties: number;
    activeProperties: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    acceptanceRate: number;
    joinedDate: Date;
}

export interface ICreateHostProfileRequest {
    businessName?: string;
    businessLicense?: string;
    taxId?: string;
    yearsOfExperience?: number;
    languages: string[];
    responseTime:
        | "within_hour"
        | "within_few_hours"
        | "within_day"
        | "few_days";
    cancellationPolicy: "flexible" | "moderate" | "strict" | "super_strict";
    instantBooking: boolean;
    minimumStay: number;
    maximumStay: number;
    checkInTime: string;
    checkOutTime: string;
    houseRules: string[];
    hostingStyle: string;
}

export interface IUpdateHostProfileRequest {
    businessName?: string;
    yearsOfExperience?: number;
    languages?: string[];
    responseTime?:
        | "within_hour"
        | "within_few_hours"
        | "within_day"
        | "few_days";
    cancellationPolicy?: "flexible" | "moderate" | "strict" | "super_strict";
    instantBooking?: boolean;
    minimumStay?: number;
    maximumStay?: number;
    checkInTime?: string;
    checkOutTime?: string;
    houseRules?: string[];
    hostingStyle?: string;
    isActive?: boolean;
}
