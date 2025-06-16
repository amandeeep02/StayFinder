import { motion } from "framer-motion";
import { Heart, Star, MapPin, Users, Bed, Bath } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/types/Property";
import { formatPrice } from "@/utils/dateHelpers";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  property: Property;
  index: number;
}

export const PropertyCard = ({ property, index }: PropertyCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/listings/${property._id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleImageNavigation = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.stopPropagation();
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Image Gallery */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="relative w-full h-full">
            <img
              src={property.images[currentImageIndex] || "/api/placeholder/400/300"}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Image Navigation */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={(e) => handleImageNavigation(e, 'prev')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleImageNavigation(e, 'next')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
                  {property.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Like Button */}
            <button
              onClick={handleLikeClick}
              className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 transition-colors duration-200"
            >
              <Heart
                className={`w-4 h-4 transition-colors duration-200 ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
            
            {/* Property Type Badge */}
            <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">
              {property.propertyType}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4 space-y-3">
          {/* Location and Rating */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {property.location.city}, {property.location.country}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {typeof property.rating === 'number' ? property.rating.toFixed(1) : '5.0'} ({property.reviewCount})
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
            {property.title}
          </h3>

          {/* Property Features */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{property.maxGuests} guests</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} bath</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(property.pricePerNight)}
              </span>
              <span className="text-gray-600 dark:text-gray-300 text-sm">
                {" "}/ night
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors duration-200"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};