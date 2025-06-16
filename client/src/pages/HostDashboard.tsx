import { useState } from "react";
import { motion } from "framer-motion";
import {
    Home,
    Calendar,
    BarChart3,
    Settings,
    MessageSquare,
    Bell,
    User,
} from "lucide-react";
import { useHost } from "@/hooks/useHost";
import { HostStats } from "@/components/host/HostStats";
import { PropertyManagement } from "@/components/host/PropertyManagement";
import { EarningsChart } from "@/components/host/EarningsChart";
import { HostBookingsList } from "@/components/host/HostBookingsList";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Property } from "@/types/Property";
import { useNavigate } from "react-router-dom";
import { bookingsAPI } from "@/utils/api";

type TabType = "overview" | "properties" | "bookings" | "analytics" | "profile";

export const HostDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [isUpdatingBooking, setIsUpdatingBooking] = useState<string | null>(null);
    const {
        host,
        stats,
        properties,
        bookings,
        earnings,
        loading,
        error,
        deleteProperty,
        refreshBookings, // Assuming this exists in useHost hook
    } = useHost();

    const handleEditProperty = (property: Property) => {
        navigate(`/host/properties/${property._id}/edit`);
    };

    const handleDeleteProperty = async (propertyId: string) => {
        if (window.confirm("Are you sure you want to delete this property?")) {
            try {
                await deleteProperty(propertyId);
                alert("Property deleted successfully");
            } catch (error) {
                alert("Failed to delete property");
            }
        }
    };

    const handleApproveBooking = async (bookingId: string) => {
        if (isUpdatingBooking) return;
        
        try {
            setIsUpdatingBooking(bookingId);
            
            // Update booking status to confirmed
            await bookingsAPI.updateStatus(bookingId, { 
                status: "confirmed" 
            });
            
            // Refresh bookings to get updated data
            if (refreshBookings) {
                await refreshBookings();
            }
            
            alert("Booking approved successfully!");
        } catch (error) {
            console.error("Failed to approve booking:", error);
            alert("Failed to approve booking. Please try again.");
        } finally {
            setIsUpdatingBooking(null);
        }
    };

    const handleRejectBooking = async (bookingId: string) => {
        if (isUpdatingBooking) return;
        
        const reason = window.prompt("Please provide a reason for rejecting this booking (optional):");
        
        try {
            setIsUpdatingBooking(bookingId);
            
            // Update booking status to rejected
            const updateData: any = { 
                status: "rejected" 
            };
            
            // Add rejection reason if provided
            if (reason && reason.trim()) {
                updateData.rejectionReason = reason.trim();
            }
            
            await bookingsAPI.updateStatus(bookingId, updateData);
            
            // Refresh bookings to get updated data
            if (refreshBookings) {
                await refreshBookings();
            }
            
            alert("Booking rejected successfully!");
        } catch (error) {
            console.error("Failed to reject booking:", error);
            alert("Failed to reject booking. Please try again.");
        } finally {
            setIsUpdatingBooking(null);
        }
    };

    const handleContactGuest = (bookingId: string) => {
        // TODO: Implement messaging
        console.log("Contact guest:", bookingId);
        alert("Messaging feature coming soon!");
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: Home },
        { id: "properties", label: "Properties", icon: Home },
        { id: "bookings", label: "Bookings", icon: Calendar },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "profile", label: "Profile", icon: User },
    ];

    const pendingBookingsCount = bookings?.filter(
        (b) => b.status === "pending"
    ).length || 0;

    // Helper function to get user initials safely
    const getUserInitials = (firstName?: string, lastName?: string) => {
        const first = firstName?.charAt(0)?.toUpperCase() || "";
        const last = lastName?.charAt(0)?.toUpperCase() || "";
        return first + last || "U";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !host || !stats) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center mt-16">
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={host.avatar} />
                                <AvatarFallback>
                                    {getUserInitials(host.firstName, host.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Welcome back, {host.firstName || "Host"}!
                                </h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Host since{" "}
                                        {host.joinedDate ? new Date(host.joinedDate).getFullYear() : "2024"}
                                    </p>
                                    {host.isVerified && (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {pendingBookingsCount > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab("bookings")}
                                    className="relative"
                                >
                                    <Bell className="w-4 h-4 mr-2" />
                                    <span>{pendingBookingsCount} Pending</span>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                                </Button>
                            )}
                            <Button variant="outline">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Messages
                            </Button>
                            <Button variant="outline">
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() =>
                                        setActiveTab(tab.id as TabType)
                                    }
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                        isActive
                                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    {tab.id === "bookings" &&
                                        pendingBookingsCount > 0 && (
                                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">
                                                {pendingBookingsCount}
                                            </Badge>
                                        )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === "overview" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <HostStats stats={stats} />
                        <EarningsChart
                            earnings={earnings}
                            totalEarnings={stats.totalEarnings}
                            monthlyEarnings={stats.monthlyEarnings}
                        />
                    </motion.div>
                )}

                {activeTab === "properties" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <PropertyManagement
                            properties={properties}
                            onEdit={handleEditProperty}
                            onDelete={handleDeleteProperty}
                        />
                    </motion.div>
                )}

                {activeTab === "bookings" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <HostBookingsList
                            bookings={bookings}
                            onApprove={handleApproveBooking}
                            onReject={handleRejectBooking}
                            onContact={handleContactGuest}
                            isUpdating={isUpdatingBooking}
                        />
                    </motion.div>
                )}

                {activeTab === "analytics" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <EarningsChart
                            earnings={earnings}
                            totalEarnings={stats.totalEarnings}
                            monthlyEarnings={stats.monthlyEarnings}
                        />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Property Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-500">
                                        Detailed analytics coming soon...
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Guest Reviews</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-500">
                                        Review insights coming soon...
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === "profile" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Host Profile</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-6">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={host.avatar} />
                                            <AvatarFallback className="text-2xl">
                                                {getUserInitials(host.firstName, host.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {host.firstName || ""} {host.lastName || ""}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                {host.email || ""}
                                            </p>
                                            {host.phone && (
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    {host.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {host.bio && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                About
                                            </h4>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {host.bio}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                Languages
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {host.languages?.map(
                                                    (language) => (
                                                        <Badge
                                                            key={language}
                                                            variant="secondary"
                                                        >
                                                            {language}
                                                        </Badge>
                                                    )
                                                ) || (
                                                    <span className="text-gray-500 text-sm">
                                                        No languages specified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                Response
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {host.responseRate || 0}% response rate
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Responds {host.responseTime || "within a day"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            <Footer />
        </div>
    );
};
