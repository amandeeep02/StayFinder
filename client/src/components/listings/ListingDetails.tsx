import { motion } from "framer-motion";
import { MapPin, Users, Bed, Bath, Wifi, Car, Waves, Dumbbell, Heart, Share2 } from "lucide-react";
import type { Property } from "@/types/Property";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ListingDetailsProps {
  property: Property;
}

const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Parking': Car,
  'Pool': Waves,
  'Gym': Dumbbell,
  'Kitchen': '🍳',
  'Air conditioning': '❄️',
  'Heating': '🔥',
  'Washer': '🧺',
  'Dryer': '👕',
  'Balcony': '🏞️',
  'Garden': '🌿',
  'Pet-friendly': '🐕',
};

export const ListingDetails = ({ property }: ListingDetailsProps) => {
  const propertyFeatures = [
    { icon: Users, label: `${property.maxGuests} guests` },
    { icon: Bed, label: `${property.bedrooms} bedroom${property.bedrooms !== 1 ? 's' : ''}` },
    { icon: Bath, label: `${property.bathrooms} bathroom${property.bathrooms !== 1 ? 's' : ''}` },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {property.title}
          </h1>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">
              {property.location.city}, {property.location.country}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>Save</span>
          </Button>
        </div>
      </motion.div>

      {/* Property Type and Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-4"
      >
        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium capitalize">
          {property.propertyType}
        </Badge>
        {propertyFeatures.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <feature.icon className="w-4 h-4" />
            <span className="text-sm">{feature.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Host Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={property.host.avatar} />
                <AvatarFallback>
                  {property.host.firstName[0]}{property.host.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Hosted by {property.host.firstName} {property.host.lastName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Host since {new Date(property.createdAt).getFullYear()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          About this place
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {property.description}
        </p>
      </motion.div>

      {/* Amenities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          What this place offers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.amenities.map((amenity, index) => {
            const IconComponent = amenityIcons[amenity];
            const isEmoji = typeof IconComponent === 'string';
            
            return (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                {isEmoji ? (
                  <span className="text-xl">{IconComponent}</span>
                ) : IconComponent ? (
                  <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  {typeof amenity === 'string' ? amenity : (amenity as any)?.name || 'Unknown amenity'}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Where you'll be
        </h2>
        <div className="space-y-2">
          <p className="font-medium text-gray-900 dark:text-white">
            {property.location.city}, {property.location.country}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            {property.location.address}
          </p>
        </div>
        
        {/* Map Placeholder */}
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p>Interactive map would go here</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};