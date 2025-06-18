export interface Host {
  _id: string;
  user: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  languages: string[];
  yearsOfExperience: number;
  isVerified?: boolean;
  isSuperhost?: boolean;
  averageRating?: number;
  responseRate: number;
  responseTime: string;
  acceptanceRate: number;
  cancellationPolicy: string;
  instantBooking: boolean;
  checkInTime: string;
  checkOutTime: string;
  minimumStay: number;
  maximumStay: number;
  hostingStyle?: string;
  houseRules: string[];
  achievements?: Achievement[];
  verifications: string[];
  isActive: boolean;
  joinedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HostStats {
  totalProperties: number;
  activeProperties: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalEarnings: number;
  monthlyEarnings: number;
  occupancyRate: number;
  averageRating: number;
}

export interface EarningsData {
  month: string;
  earnings: number;
  bookings: number;
}

export interface Achievement {
  type: string;
  title: string;
  description: string;
  earnedAt?: string;
}