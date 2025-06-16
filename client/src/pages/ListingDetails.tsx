import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";
import { useProperty } from "@/hooks/useProperties";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { ListingDetails as ListingDetailsComponent } from "@/components/listings/ListingDetails";
import { BookingCard } from "@/components/listings/BookingCard";
import { ReviewCard } from "@/components/listings/ReviewCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/shared/Footer";

// Mock reviews data (replace with API call later)
const mockReviews = [
  {
    _id: '1',
    guest: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150'
    },
    rating: 5,
    comment: 'Amazing place! The location was perfect and the host was very responsive. Would definitely stay here again.',
    createdAt: '2024-01-15'
  },
  {
    _id: '2',
    guest: {
      firstName: 'Michael',
      lastName: 'Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    rating: 4,
    comment: 'Great apartment with all the amenities we needed. Very clean and comfortable.',
    createdAt: '2024-01-10'
  },
  {
    _id: '3',
    guest: {
      firstName: 'Emma',
      lastName: 'Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    },
    rating: 5,
    comment: 'Exceeded our expectations! The photos don\'t do justice to how beautiful this place is.',
    createdAt: '2024-01-05'
  }
];

export const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { property, loading, error } = useProperty(id!);
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Property not found
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error || "The property you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => navigate('/home')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Ensure property has required fields with defaults
  const safeProperty = {
    ...property,
    rating: property.rating || 5.0,
    reviewCount: property.reviewCount || 0,
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    images: Array.isArray(property.images) ? property.images : []
  };

  const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ListingGallery images={property.images} title={property.title} />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            <ListingDetailsComponent property={safeProperty} />

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reviews
                  </h2>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {property.rating?.toFixed(1) || '5.0'}
                    </span>
                    <span className="text-gray-500">
                      · {property.reviewCount || 1} reviews
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedReviews.map((review, index) => (
                  <ReviewCard key={review._id} review={review} index={index} />
                ))}
              </div>

              {mockReviews.length > 2 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                  >
                    {showAllReviews ? 'Show Less' : `Show All ${mockReviews.length} Reviews`}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BookingCard property={safeProperty} />
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};