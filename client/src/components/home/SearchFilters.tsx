import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, DollarSign, Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { PropertyFilters } from "@/types/Property";

interface SearchFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: Partial<PropertyFilters>) => void;
  onClearFilters: () => void;
}

const propertyTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "loft", label: "Loft" },
];

const amenities = [
  "WiFi", "Kitchen", "Parking", "Pool", "Gym", "Pet-friendly",
  "Air conditioning", "Heating", "Washer", "Dryer", "Balcony", "Garden"
];

export const SearchFilters = ({ filters, onFiltersChange, onClearFilters }: SearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 1000]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      minPrice: values[0],
      maxPrice: values[1]
    });
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    onFiltersChange({ amenities: newAmenities });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="sticky top-20 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white rounded-full px-2 py-1 text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          )}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {/* Price Range */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Price Range</span>
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceChange}
                      max={1000}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Home className="w-4 h-4" />
                    <span>Property Type</span>
                  </Label>
                  <Select
                    value={filters.propertyType || ""}
                    onValueChange={(value) => onFiltersChange({ propertyType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Guests */}
                <div className="space-y-4">
                  <Label className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Guests</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="Any"
                    min="1"
                    value={filters.guests || ""}
                    onChange={(e) => onFiltersChange({ guests: parseInt(e.target.value) || undefined })}
                  />
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <Label>Check-in / Check-out</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={filters.checkIn || ""}
                      onChange={(e) => onFiltersChange({ checkIn: e.target.value })}
                    />
                    <Input
                      type="date"
                      value={filters.checkOut || ""}
                      onChange={(e) => onFiltersChange({ checkOut: e.target.value })}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="md:col-span-2 lg:col-span-4 space-y-4">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {amenities.map((amenity) => (
                      <Button
                        key={amenity}
                        variant={filters.amenities?.includes(amenity) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAmenity(amenity)}
                        className="justify-start"
                      >
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};