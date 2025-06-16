import type { Property } from "./Property";

export interface Booking {
  reviewed: any;
  _id: string;
  property: string | Property;
  guest: string;
  host: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  // Add these for better UI
  cancellationReason?: string;
  specialRequests?: string;
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