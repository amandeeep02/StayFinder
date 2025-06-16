import { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  MessageSquare, 
  
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal
} from "lucide-react";
import type { Booking } from "@/types/Booking";
import type { Property } from "@/types/Property";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice, formatDateRange, calculateNights } from "@/utils/dateHelpers";
import { useNavigate } from "react-router-dom";

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string, reason?: string) => void;
  onReview?: (bookingId: string) => void;
}

const statusConfig = {
  pending: { 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
    label: 'Pending Confirmation'
  },
  confirmed: { 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
    label: 'Confirmed'
  },
  cancelled: { 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
    label: 'Cancelled'
  },
  completed: { 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: CheckCircle,
    label: 'Completed'
  }
};

export const BookingCard = ({ booking, onCancel, onReview }: BookingCardProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();
  
  // Safe property and host access with defaults
  const property = booking.property as Property;
  const host = property?.host || {
    firstName: 'Unknown',
    lastName: 'Host',
    avatar: ''
  };
  
  const status = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  
  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const isUpcoming = booking.status === 'confirmed' && new Date(booking.checkIn) > new Date();
  const isPast = new Date(booking.checkOut) < new Date();
  const canCancel = booking.status === 'confirmed' && !isPast;
  const canReview = booking.status === 'completed' && !booking.reviewed;

  const handleViewProperty = () => {
    if (property?._id) {
      navigate(`/listings/${property._id}`);
    }
  };

  const handleContactHost = () => {
    // TODO: Implement messaging functionality
    alert('Messaging feature coming soon!');
  };

  // Early return if booking or property is missing
  if (!booking || !property) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 text-center text-gray-500">
          <p>Booking information unavailable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className="w-4 h-4 text-gray-500" />
            <Badge className={status.color}>
              {status.label}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewProperty}>
                View Property
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleContactHost}>
                Contact Host
              </DropdownMenuItem>
              {canCancel && (
                <DropdownMenuItem 
                  onClick={() => setShowCancelDialog(true)}
                  className="text-red-600"
                >
                  Cancel Booking
                </DropdownMenuItem>
              )}
              {canReview && (
                <DropdownMenuItem onClick={() => onReview?.(booking._id)}>
                  Write Review
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Property Info */}
        <div className="flex space-x-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={property.images?.[0] || "/api/placeholder/200/200"}
              alt={property.title || "Property"}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {property.title || "Untitled Property"}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              <span>
                {property.location?.city || "Unknown"}, {property.location?.country || "Unknown"}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDateRange(booking.checkIn, booking.checkOut)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{booking.guests || 1} guests</span>
              </div>
            </div>
          </div>
        </div>

        {/* Host Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={host.avatar} />
              <AvatarFallback className="text-xs">
                {host.firstName?.[0] || 'U'}{host.lastName?.[0] || 'H'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {host.firstName || 'Unknown'} {host.lastName || 'Host'}
              </p>
              <p className="text-xs text-gray-500">Host</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatPrice(booking.totalPrice || 0)}
            </p>
            <p className="text-xs text-gray-500">
              {nights} nights
            </p>
          </div>
        </div>

        {/* Special Requests */}
        {booking.specialRequests && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Special Requests
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {booking.specialRequests}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Reason */}
        {booking.status === 'cancelled' && booking.cancellationReason && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                  Cancellation Reason
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {booking.cancellationReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProperty}
            className="flex-1"
          >
            View Property
          </Button>
          
          {isUpcoming && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleContactHost}
              className="flex items-center space-x-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Message</span>
            </Button>
          )}
          
          {canReview && (
            <Button
              size="sm"
              onClick={() => onReview?.(booking._id)}
              className="flex items-center space-x-1"
            >
              <Star className="w-3 h-3" />
              <span>Review</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};