import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Star, Shield, Clock, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Property } from "@/types/Property";
import { formatPrice, calculateNights, formatDateRange } from "@/utils/dateHelpers";
import { useBookings } from "@/hooks/useBookings";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface BookingFormData {
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    adults: number;
    children: number;
  };
}

interface BookingCardProps {
  property: Property;
}

export const BookingCard = ({ property }: BookingCardProps) => {
  const [bookingData, setBookingData] = useState<BookingFormData>({
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
    guestDetails: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      adults: 1,
      children: 0,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createBooking } = useBookings();

  const nights = bookingData.checkInDate && bookingData.checkOutDate 
    ? calculateNights(bookingData.checkInDate, bookingData.checkOutDate)
    : 0;
  
  const subtotal = nights * property.pricePerNight;
  const serviceFee = subtotal * 0.12; // 12% service fee
  const taxes = subtotal * 0.08; // 8% taxes
  const total = subtotal + serviceFee + taxes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (new Date(bookingData.checkOutDate) <= new Date(bookingData.checkInDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    if (bookingData.numberOfGuests < 1 || bookingData.numberOfGuests > 50) {
      alert('Number of guests must be between 1 and 50');
      return;
    }

    if (bookingData.numberOfGuests > property.maxGuests) {
      alert(`Maximum ${property.maxGuests} guests allowed`);
      return;
    }

    if (bookingData.guestDetails.adults < 1) {
      alert('At least one adult is required');
      return;
    }

    if (bookingData.numberOfGuests !== (bookingData.guestDetails.adults + bookingData.guestDetails.children)) {
      alert('Number of guests must equal adults + children');
      return;
    }

    if (!bookingData.guestDetails.firstName.trim()) {
      alert('First name is required');
      return;
    }

    if (!bookingData.guestDetails.lastName.trim()) {
      alert('Last name is required');
      return;
    }

    if (!bookingData.guestDetails.email.trim()) {
      alert('Email is required');
      return;
    }

    if (!bookingData.guestDetails.phone.trim()) {
      alert('Phone number is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await createBooking({
        propertyId: property._id,
        ...bookingData,
      });
      
      // Show success message or redirect
      alert('Booking created successfully!');
    } catch (error) {
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateGuestDetails = (field: keyof BookingFormData['guestDetails'], value: string | number) => {
    setBookingData(prev => ({
      ...prev,
      guestDetails: {
        ...prev.guestDetails,
        [field]: value,
      },
    }));
  };

  const updateGuestCount = () => {
    const totalGuests = bookingData.guestDetails.adults + bookingData.guestDetails.children;
    setBookingData(prev => ({
      ...prev,
      numberOfGuests: totalGuests,
    }));
  };

  const isValidBooking = bookingData.checkInDate && 
                        bookingData.checkOutDate && 
                        bookingData.numberOfGuests >= 1 && 
                        bookingData.numberOfGuests <= property.maxGuests &&
                        new Date(bookingData.checkOutDate) > new Date(bookingData.checkInDate) &&
                        new Date(bookingData.checkInDate) >= new Date() &&
                        bookingData.guestDetails.firstName.trim() &&
                        bookingData.guestDetails.lastName.trim() &&
                        bookingData.guestDetails.email.trim() &&
                        bookingData.guestDetails.phone.trim() &&
                        bookingData.guestDetails.adults >= 1 &&
                        bookingData.numberOfGuests === (bookingData.guestDetails.adults + bookingData.guestDetails.children);

  return (
    <Card className="sticky top-24 shadow-xl border-0 bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(property.pricePerNight)}
            </span>
            <span className="text-gray-600 dark:text-gray-300 ml-1">/ night</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {property.rating?.toFixed(1) || '5.0'}
            </span>
            <span className="text-gray-500 text-sm">
              ({property.reviewCount || 0} reviews)
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>Check-in</span>
              </Label>
              <Input
                type="date"
                value={bookingData.checkInDate}
                onChange={(e) => setBookingData(prev => ({ ...prev, checkInDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>Check-out</span>
              </Label>
              <Input
                type="date"
                value={bookingData.checkOutDate}
                onChange={(e) => setBookingData(prev => ({ ...prev, checkOutDate: e.target.value }))}
                min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Guest Details */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2 text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>Guest Details</span>
            </Label>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Adults</Label>
                <Input
                  type="number"
                  value={bookingData.guestDetails.adults}
                  onChange={(e) => {
                    const adults = parseInt(e.target.value) || 1;
                    updateGuestDetails('adults', adults);
                    updateGuestCount();
                  }}
                  min="1"
                  max={property.maxGuests}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Children</Label>
                <Input
                  type="number"
                  value={bookingData.guestDetails.children}
                  onChange={(e) => {
                    const children = parseInt(e.target.value) || 0;
                    updateGuestDetails('children', children);
                    updateGuestCount();
                  }}
                  min="0"
                  max={property.maxGuests - 1}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Total guests: {bookingData.numberOfGuests} (Maximum {property.maxGuests})
            </div>
          </div>

          <Separator />

          {/* Guest Information */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2 text-sm font-medium">
              <User className="w-4 h-4" />
              <span>Primary Guest Information</span>
            </Label>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">First Name</Label>
                <Input
                  type="text"
                  value={bookingData.guestDetails.firstName}
                  onChange={(e) => updateGuestDetails('firstName', e.target.value)}
                  placeholder="Enter first name"
                  maxLength={50}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Last Name</Label>
                <Input
                  type="text"
                  value={bookingData.guestDetails.lastName}
                  onChange={(e) => updateGuestDetails('lastName', e.target.value)}
                  placeholder="Enter last name"
                  maxLength={50}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-xs text-gray-600">
                <Mail className="w-3 h-3" />
                <span>Email</span>
              </Label>
              <Input
                type="email"
                value={bookingData.guestDetails.email}
                onChange={(e) => updateGuestDetails('email', e.target.value)}
                placeholder="Enter email address"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-xs text-gray-600">
                <Phone className="w-3 h-3" />
                <span>Phone Number</span>
              </Label>
              <Input
                type="tel"
                value={bookingData.guestDetails.phone}
                onChange={(e) => updateGuestDetails('phone', e.target.value)}
                placeholder="Enter phone number"
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Price Breakdown */}
          {nights > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600"
            >
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>{formatPrice(property.pricePerNight)} × {nights} nights</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Service fee</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Taxes</span>
                <span>{formatPrice(taxes)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </motion.div>
          )}

          {/* Reserve Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={!isValidBooking || isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                'Reserve'
              )}
            </Button>
          </div>

          {/* Booking Info */}
          <div className="text-center text-sm text-gray-500 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>You won't be charged yet</span>
            </div>
            {nights > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{formatDateRange(bookingData.checkInDate, bookingData.checkOutDate)}</span>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};