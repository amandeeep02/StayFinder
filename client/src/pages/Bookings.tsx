import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MessageSquare } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { BookingsList } from "@/components/bookings/BookingsList";
import { BookingStats } from "@/components/bookings/BookingStats";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Bookings = () => {
  const { bookings, loading, error, stats, cancelBooking } = useBookings();
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCancelBooking = async (bookingId: string, reason?: string) => {
    try {
      setCancellingBookingId(bookingId);
      await cancelBooking(bookingId, reason);
      // Show success message
      alert('Booking cancelled successfully');
    } catch (error) {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleReviewBooking = (bookingId: string) => {
    // TODO: Implement review modal/page
    alert('Review functionality coming soon!');
  };

  // Calculate total spent using totalAmount field
  const totalSpent = bookings
    .filter(booking => booking.status === 'completed')
    .reduce((sum, booking) => sum + (booking.totalAmount || booking.totalPrice || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Bookings
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage your reservations and travel history
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/messages')}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </Button>
              <Button
                onClick={() => navigate('/home')}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4" />
                <span>Book New Stay</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <BookingStats stats={stats} totalSpent={totalSpent} />

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Bookings
              </h2>
              <div className="text-sm text-gray-500">
                {bookings.length} total bookings
              </div>
            </div>
            
            <BookingsList
              bookings={bookings}
              loading={cancellingBookingId !== null}
              onCancel={handleCancelBooking}
              onReview={handleReviewBooking}
            />
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};