import type { Property } from "./Property";

export interface Booking {
  _id: string;
  property: string | Property;
  guest: string | {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  host: string | {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  // Updated field names to match backend
  checkInDate: string;
  checkOutDate: string;
  checkIn?: string; // Keep for backward compatibility
  checkOut?: string; // Keep for backward compatibility
  numberOfGuests: number;
  guests?: number; // Keep for backward compatibility
  totalAmount: number;
  totalPrice?: number; // Keep for backward compatibility
  
  // Additional fields from backend
  totalNights: number;
  pricePerNight: number;
  subtotal: number;
  serviceFee: number;
  taxes: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    adults: number;
    children: number;
    infants: number;
  };
  cancellationPolicy: string;
  
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  
  // Optional fields
  reviewed?: boolean;
  cancellationReason?: string;
  specialRequests?: string;
  rejectionReason?: string;
}

export interface BookingFormData {
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface BookingStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}