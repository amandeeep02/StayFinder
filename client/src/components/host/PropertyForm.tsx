import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, 
  X, 
  MapPin, 
  DollarSign, 
  Home, 
  Users, 
  Bed, 
  Bath,
  Plus,
  Trash2,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Property, PropertyFormData } from "@/types/Property";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const propertyTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "loft", label: "Loft" },
];

const availableAmenities = [
  "WiFi", "Kitchen", "Parking", "Pool", "Gym", "Pet-friendly",
  "Air conditioning", "Heating", "Washer", "Dryer", "Balcony", 
  "Garden", "Hot tub", "Fireplace", "TV", "Workspace"
];

const houseRules = [
  "No smoking", "No parties", "No pets", "Quiet hours after 10 PM",
  "Check-in after 3 PM", "Check-out before 11 AM", "Maximum occupancy enforced"
];

export const PropertyForm = ({ property, onSubmit, onCancel, loading = false }: PropertyFormProps) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    pricePerNight: 0, // Changed from 'price' to 'pricePerNight'
    location: {
      city: "",
      state: "", // Added state field
      country: "",
      address: "",
      zipCode: "", // Added zipCode field
    },
    images: [],
    amenities: [],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 1,
    propertyType: "apartment",
    rules: [],
    checkInTime: "15:00",
    checkOutTime: "11:00",
    minimumStay: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageInput, setImageInput] = useState("");

  // Initialize form with existing property data
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        pricePerNight: property.price || 0, 
        location: {
          city: property.location.city,
          state: "",
          country: property.location.country,
          address: property.location.address,
          zipCode: "",
        },
        images: property.images,
        amenities: property.amenities,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        propertyType: property.propertyType,
        rules: (property as any).rules || [],
        checkInTime: (property as any).checkInTime || "15:00",
        checkOutTime: (property as any).checkOutTime || "11:00",
        minimumStay: (property as any).minimumStay || 1,
      });
    }
  }, [property]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.pricePerNight <= 0) newErrors.pricePerNight = "Price per night must be greater than 0";
    if (!formData.location.city.trim()) newErrors.city = "City is required";
    if (!formData.location.state.trim()) newErrors.state = "State is required";
    if (!formData.location.country.trim()) newErrors.country = "Country is required";
    if (!formData.location.address.trim()) newErrors.address = "Address is required";
    if (!formData.location.zipCode.trim()) newErrors.zipCode = "Zip code is required";
    if (formData.images.length === 0) newErrors.images = "At least one image is required";
    if (formData.bedrooms < 1) newErrors.bedrooms = "Must have at least 1 bedroom";
    if (formData.bathrooms < 1) newErrors.bathrooms = "Must have at least 1 bathroom";
    if (formData.maxGuests < 1) newErrors.maxGuests = "Must accommodate at least 1 guest";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleLocationChange = (field: keyof PropertyFormData['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput("");
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: "" }));
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleRule = (rule: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules?.includes(rule)
        ? prev.rules.filter(r => r !== rule)
        : [...(prev.rules || []), rule]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {property ? 'Edit Property' : 'Add New Property'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {property ? 'Update your property details' : 'Create a new listing for your property'}
              </p>
            </div>
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Beautiful Downtown Apartment"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your property in detail..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => handleInputChange('propertyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                  <div className="space-y-2">
                    <Label htmlFor="pricePerNight" className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Price per night *</span>
                    </Label>
                    <Input
                      id="pricePerNight"
                      type="number"
                      value={formData.pricePerNight}
                      onChange={(e) => handleInputChange('pricePerNight', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className={errors.pricePerNight ? 'border-red-500' : ''}
                    />
                    {errors.pricePerNight && <p className="text-sm text-red-600">{errors.pricePerNight}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.location.city}
                      onChange={(e) => handleLocationChange('city', e.target.value)}
                      placeholder="e.g., New York"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.location.state}
                      onChange={(e) => handleLocationChange('state', e.target.value)}
                      placeholder="e.g., New York"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.location.country}
                      onChange={(e) => handleLocationChange('country', e.target.value)}
                      placeholder="e.g., United States"
                      className={errors.country ? 'border-red-500' : ''}
                    />
                    {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.location.zipCode}
                      onChange={(e) => handleLocationChange('zipCode', e.target.value)}
                      placeholder="e.g., 10001"
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && <p className="text-sm text-red-600">{errors.zipCode}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    value={formData.location.address}
                    onChange={(e) => handleLocationChange('address', e.target.value)}
                    placeholder="e.g., 123 Main Street, Downtown"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Property Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Property Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms" className="flex items-center space-x-1">
                      <Bed className="w-4 h-4" />
                      <span>Bedrooms *</span>
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 1)}
                      min="1"
                      className={errors.bedrooms ? 'border-red-500' : ''}
                    />
                    {errors.bedrooms && <p className="text-sm text-red-600">{errors.bedrooms}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms" className="flex items-center space-x-1">
                      <Bath className="w-4 h-4" />
                      <span>Bathrooms *</span>
                    </Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                      min="1"
                      className={errors.bathrooms ? 'border-red-500' : ''}
                    />
                    {errors.bathrooms && <p className="text-sm text-red-600">{errors.bathrooms}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxGuests">Max Guests *</Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      value={formData.maxGuests}
                      onChange={(e) => handleInputChange('maxGuests', parseInt(e.target.value) || 1)}
                      min="1"
                      className={errors.maxGuests ? 'border-red-500' : ''}
                    />
                    {errors.maxGuests && <p className="text-sm text-red-600">{errors.maxGuests}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumStay">Min Stay (nights)</Label>
                    <Input
                      id="minimumStay"
                      type="number"
                      value={formData.minimumStay}
                      onChange={(e) => handleInputChange('minimumStay', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">Check-in Time</Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={formData.checkInTime}
                      onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime">Check-out Time</Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={formData.checkOutTime}
                      onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addImage}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 bg-blue-600">
                            Main Photo
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Amenities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* House Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>House Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {houseRules.map((rule) => (
                    <div key={rule} className="flex items-center space-x-2">
                      <Checkbox
                        id={rule}
                        checked={formData.rules?.includes(rule)}
                        onCheckedChange={() => toggleRule(rule)}
                      />
                      <Label htmlFor={rule} className="text-sm">
                        {rule}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end space-x-4"
          >
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {property ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {property ? 'Update Property' : 'Create Property'}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};