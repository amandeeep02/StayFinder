import { useState } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    Star,
    Calendar,
    TrendingUp,
    MapPin,
    Home,
} from "lucide-react";
import type { Property } from "@/types/Property";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/utils/dateHelpers";
import { useNavigate } from "react-router-dom";

interface PropertyManagementProps {
    properties: Property[];
    onEdit: (property: Property) => void;
    onDelete: (propertyId: string) => void;
}

export const PropertyManagement = ({
    properties,
    onDelete,
}: PropertyManagementProps) => {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAddProperty = () => {
        navigate("/host/properties/new");
    };

    const handleViewProperty = (propertyId: string) => {
        navigate(`/property/${propertyId}`);
    };

    const handleEditProperty = (property: Property) => {
        navigate(`/host/property/edit/${property._id}`);
    };

    const handleDeleteProperty = async (propertyId: string) => {
        if (!confirm("Are you sure you want to delete this property?")) return;

        try {
            setDeletingId(propertyId);
            await onDelete(propertyId);
        } catch (error) {
            alert("Failed to delete property");
        } finally {
            setDeletingId(null);
        }
    };

    // Generate mock stats for each property
    const generateStats = (property: Property) => {
        return {
            views: Math.floor(Math.random() * 1000) + 100,
            bookings: Math.floor(Math.random() * 20) + 5,
            revenue: Math.floor(Math.random() * 5000) + 1000,
            occupancyRate: Math.floor(Math.random() * 40) + 60,
        };
    };

    if (properties.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Home className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No properties yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                        Start earning by listing your first property
                    </p>
                    <Button
                        onClick={handleAddProperty}
                        className="flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Property</span>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Your Properties
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Manage your {properties.length} properties
                    </p>
                </div>
                <Button
                    onClick={handleAddProperty}
                    className="flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Property</span>
                </Button>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property, index) => {
                    const stats = generateStats(property);

                    return (
                        <motion.div
                            key={property._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative">
                                    <img
                                        src={
                                            property.images[0] ||
                                            "/api/placeholder/400/200"
                                        }
                                        alt={property.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleViewProperty(
                                                            property._id
                                                        )
                                                    }
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleEditProperty(
                                                            property
                                                        )
                                                    }
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDeleteProperty(
                                                            property._id
                                                        )
                                                    }
                                                    className="text-red-600"
                                                    disabled={
                                                        deletingId ===
                                                        property._id
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    {deletingId === property._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <Badge
                                            variant={
                                                property.isActive
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {property.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>

                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg font-semibold truncate">
                                                {property.title}
                                            </CardTitle>
                                            <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>
                                                    {property.location.city},{" "}
                                                    {property.location.country}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {formatPrice(
                                                    property.pricePerNight
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                per night
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Stats */}
                                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 pt-2">
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                            <span>{property.rating}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            <span>
                                                {stats.bookings} bookings
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <TrendingUp className="w-3 h-3 text-green-500" />
                                            <span>
                                                {stats.occupancyRate}% occupied
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    {/* Quick Stats */}
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {stats.views}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Views
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {stats.bookings}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Bookings
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {formatPrice(stats.revenue)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Revenue
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
