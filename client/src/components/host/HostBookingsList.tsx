import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  MessageSquare,
  Phone,
  Filter,
  AlertTriangle
} from "lucide-react";
import type { Booking } from "@/types/Booking";
import type { Property } from "@/types/Property";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, formatDateRange } from "@/utils/dateHelpers";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface HostBookingsListProps {
  bookings: Booking[];
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onContact?: (bookingId: string) => void;
  isUpdating?: string | null;
}

const statusConfig = {
  pending: { 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
    label: 'Pending'
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
  },
  rejected: { 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertTriangle,
    label: 'Rejected'
  }
};

export const HostBookingsList = ({ bookings, onApprove, onReject, onContact, isUpdating }: HostBookingsListProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status === statusFilter
  );

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    // Pending bookings first, then by check-in date
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (b.status === 'pending' && a.status !== 'pending') return 1;
    return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bookings
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      {sortedBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {statusFilter === 'all' ? 'No bookings yet' : `No ${statusFilter} bookings`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedBookings.map((booking, index) => {
            const property = booking.property as Property;
            const status = statusConfig[booking.status];
            const StatusIcon = status.icon;
            const isPending = booking.status === 'pending';
            const isBeingUpdated = isUpdating === booking._id;
            
            // Handle guest data safely
            const guest = booking.guest;
            const guestName = typeof guest === 'object' && guest !== null 
              ? `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'Guest'
              : typeof guest === 'string' 
                ? `Guest ${guest.slice(-6)}`
                : 'Guest';
            
            const guestInitials = typeof guest === 'object' && guest !== null
              ? `${guest.firstName?.[0] || 'G'}${guest.lastName?.[0] || 'U'}`
              : 'GU';
            
            const guestId = typeof guest === 'object' && guest !== null
              ? guest._id || 'Unknown'
              : typeof guest === 'string'
                ? guest
                : 'Unknown';
            
            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-lg transition-shadow duration-200 ${
                  isPending ? 'ring-2 ring-yellow-200 dark:ring-yellow-800' : ''
                } ${isBeingUpdated ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="w-4 h-4 text-gray-500" />
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                        {isPending && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Action Required
                          </Badge>
                        )}
                        {isBeingUpdated && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <LoadingSpinner size="sm" className="mr-1" />
                            Updating...
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Booking #{booking._id.slice(-6)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Property & Guest Info */}
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={property?.images?.[0] || "/api/placeholder/200/200"}
                          alt={property?.title || "Property"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {property?.title || "Untitled Property"}
                        </h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {property?.location?.city || "Unknown"}, {property?.location?.country || "Unknown"}
                          </span>
                        </div>
                        
                        {/* Guest Info */}
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {guestInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {guestName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.guests || 1} guests · {formatDateRange(booking.checkIn, booking.checkOut)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatPrice(booking.totalPrice || 0)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total
                        </p>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                          Special Requests
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {booking.status === 'rejected' && booking.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                              Rejection Reason
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              {booking.rejectionReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onApprove?.(booking._id)}
                            disabled={isBeingUpdated}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {isBeingUpdated ? (
                              <LoadingSpinner size="sm" className="mr-2" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReject?.(booking._id)}
                            disabled={isBeingUpdated}
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                          >
                            {isBeingUpdated ? (
                              <LoadingSpinner size="sm" className="mr-2" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Decline
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onContact?.(booking._id)}
                          className="flex items-center space-x-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Contact Guest</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};