export interface Host {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  joinedDate: string;
  rating: number;
  reviewCount: number;
  responseRate: number;
  responseTime: string; // e.g., "within an hour"
  languages: string[];
  propertyCount: number;
  totalEarnings: number;
  completedBookings: number;
  createdAt: string;
  updatedAt: string;
}

export interface HostStats {
  totalProperties: number;
  activeProperties: number;
  totalBookings: number;
  pendingBookings: number;
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