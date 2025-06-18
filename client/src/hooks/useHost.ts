import { useState, useEffect } from "react";
import type { Host, HostStats, EarningsData } from "@/types/Host";
import type { Property } from "@/types/Property";
import type { Booking } from "@/types/Booking";
import { hostAPI, propertiesAPI, bookingsAPI } from "@/utils/api";

export const useHost = () => {
    const [host, setHost] = useState<Host | null>(null);
    const [stats, setStats] = useState<HostStats | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [earnings, setEarnings] = useState<EarningsData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHostData = async () => {
            try {
                setLoading(true);

                // Fetch data in parallel
                const [dashboardRes, propertiesRes, bookingsRes] =
                    await Promise.all([
                        hostAPI.getDashboard(), // This returns host and stats data
                        propertiesAPI.getByHost(), // This returns properties array
                        bookingsAPI.getHostBookings(), // This returns bookings with pagination
                    ]);

                // Extract host data from dashboard response
                const dashboardData = dashboardRes.data;
                setHost(dashboardData.host);

                // Map the stats from dashboard data
                const mappedStats: HostStats = {
                    totalProperties: dashboardData.stats?.totalProperties || 0,
                    activeProperties: dashboardData.stats?.activeProperties || 0,
                    totalBookings: dashboardData.stats?.totalBookings || 0,
                    pendingBookings: dashboardData.stats?.pendingBookings || 0,
                    completedBookings: dashboardData.stats?.completedBookings || 0,
                    cancelledBookings: dashboardData.stats?.cancelledBookings || 0,
                    totalEarnings: dashboardData.earnings?.totalEarnings || 0,
                    monthlyEarnings: dashboardData.earnings?.currentMonthEarnings || 0,
                    occupancyRate: dashboardData.earnings?.occupancyRate || 0,
                    averageRating: dashboardData.host?.averageRating || 0,
                };
                setStats(mappedStats);

                // Set properties (already an array)
                setProperties(propertiesRes.data.properties || propertiesRes.data || []);
                
                // Set bookings from the response
                setBookings(bookingsRes.data.bookings || bookingsRes.data || []);

                // Calculate earnings data from earnings object or bookings
                if (dashboardData.earnings) {
                    const earningsData = [
                        {
                            month: new Date().toISOString().substring(0, 7),
                            earnings: dashboardData.earnings.currentMonthEarnings || 0,
                            bookings: dashboardData.stats?.totalBookings || 0,
                        }
                    ];
                    setEarnings(earningsData);
                } else {
                    // Calculate earnings from bookings if not provided by API
                    const earningsData = calculateEarningsFromBookings(
                        bookingsRes.data.bookings || bookingsRes.data || []
                    );
                    setEarnings(earningsData);
                }

                setError(null);
            } catch (err: any) {
                console.error("Error fetching host data:", err);
                setError(
                    err.response?.data?.error || "Failed to fetch host data"
                );

                // Reset data on error
                setHost(null);
                setStats(null);
                setProperties([]);
                setBookings([]);
                setEarnings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHostData();
    }, []);

    // Helper function to calculate earnings from bookings
    const calculateEarningsFromBookings = (
        bookings: Booking[]
    ): EarningsData[] => {
        const earningsMap = new Map<string, number>();

        bookings.forEach((booking) => {
            if (
                booking.status === "confirmed" ||
                booking.status === "completed"
            ) {
                // Use checkInDate if available, fallback to checkIn
                const checkInDate = booking.checkInDate || booking.checkIn;
                const month = new Date(checkInDate)
                    .toISOString()
                    .substring(0, 7); // YYYY-MM format
                const currentEarnings = earningsMap.get(month) || 0;
                // Use totalAmount if available, fallback to totalPrice
                const amount = booking.totalAmount || booking.totalPrice || 0;
                earningsMap.set(month, currentEarnings + amount);
            }
        });

        return Array.from(earningsMap.entries()).map(([month, amount]) => ({
            month,
            earnings: amount,
            bookings: bookings.filter(
                (b) => {
                    const checkInDate = b.checkInDate || b.checkIn;
                    return new Date(checkInDate).toISOString().substring(0, 7) === month &&
                        (b.status === "confirmed" || b.status === "completed");
                }
            ).length,
        }));
    };

    const refreshData = async () => {
        try {
            setLoading(true);

            const [dashboardRes, propertiesRes, bookingsRes] =
                await Promise.all([
                    hostAPI.getDashboard(),
                    propertiesAPI.getByHost(),
                    bookingsAPI.getHostBookings(),
                ]);

            const dashboardData = dashboardRes.data;
            setHost(dashboardData.host);

            const mappedStats: HostStats = {
                totalProperties: dashboardData.stats?.totalProperties || 0,
                activeProperties: dashboardData.stats?.activeProperties || 0,
                totalBookings: dashboardData.stats?.totalBookings || 0,
                pendingBookings: dashboardData.stats?.pendingBookings || 0,
                completedBookings: dashboardData.stats?.completedBookings || 0,
                cancelledBookings: dashboardData.stats?.cancelledBookings || 0,
                totalEarnings: dashboardData.earnings?.totalEarnings || 0,
                monthlyEarnings: dashboardData.earnings?.currentMonthEarnings || 0,
                occupancyRate: dashboardData.earnings?.occupancyRate || 0,
                averageRating: dashboardData.host?.averageRating || 0,
            };
            setStats(mappedStats);

            setProperties(propertiesRes.data.properties || propertiesRes.data || []);
            setBookings(bookingsRes.data.bookings || bookingsRes.data || []);

            if (dashboardData.earnings) {
                const earningsData = [
                    {
                        month: new Date().toISOString().substring(0, 7),
                        earnings: dashboardData.earnings.currentMonthEarnings || 0,
                        bookings: dashboardData.stats?.totalBookings || 0,
                    }
                ];
                setEarnings(earningsData);
            } else {
                const earningsData = calculateEarningsFromBookings(
                    bookingsRes.data.bookings || bookingsRes.data || []
                );
                setEarnings(earningsData);
            }

            setError(null);
        } catch (err: any) {
            console.error("Error refreshing host data:", err);
            setError(
                err.response?.data?.error || "Failed to refresh host data"
            );
        } finally {
            setLoading(false);
        }
    };

    // Add refreshBookings function for the dashboard
    const refreshBookings = async () => {
        try {
            const bookingsRes = await bookingsAPI.getHostBookings();
            setBookings(bookingsRes.data.bookings || bookingsRes.data || []);
        } catch (err: any) {
            console.error("Error refreshing bookings:", err);
            throw new Error(
                err.response?.data?.error || "Failed to refresh bookings"
            );
        }
    };

    const updateProperty = async (
        propertyId: string,
        data: Partial<Property>
    ) => {
        try {
            const response = await propertiesAPI.update(propertyId, data);
            setProperties((prev) =>
                prev.map((property) =>
                    property._id === propertyId
                        ? { ...property, ...response.data }
                        : property
                )
            );
            return response.data;
        } catch (err: any) {
            console.error("Error updating property:", err);
            throw new Error(
                err.response?.data?.error || "Failed to update property"
            );
        }
    };

    const deleteProperty = async (propertyId: string) => {
        try {
            await propertiesAPI.delete(propertyId);
            setProperties((prev) =>
                prev.filter((property) => property._id !== propertyId)
            );
        } catch (err: any) {
            console.error("Error deleting property:", err);
            throw new Error(
                err.response?.data?.error || "Failed to delete property"
            );
        }
    };

    const togglePropertyStatus = async (propertyId: string) => {
        try {
            const response = await propertiesAPI.toggleStatus(propertyId);
            setProperties((prev) =>
                prev.map((property) =>
                    property._id === propertyId
                        ? { ...property, ...response.data }
                        : property
                )
            );
            return response.data;
        } catch (err: any) {
            console.error("Error toggling property status:", err);
            throw new Error(
                err.response?.data?.error || "Failed to toggle property status"
            );
        }
    };

    const createProperty = async (propertyData: any) => {
        try {
            const response = await propertiesAPI.create(propertyData);
            setProperties((prev) => [...prev, response.data]);
            return response.data;
        } catch (err: any) {
            console.error("Error creating property:", err);
            throw new Error(
                err.response?.data?.error || "Failed to create property"
            );
        }
    };

    const updateHostProfile = async (profileData: Partial<Host>) => {
        try {
            const response = await hostAPI.updateProfile(profileData);
            setHost(response.data);
            return response.data;
        } catch (err: any) {
            console.error("Error updating host profile:", err);
            throw new Error(
                err.response?.data?.error || "Failed to update host profile"
            );
        }
    };

    const submitVerification = async (verificationData: any) => {
        try {
            const response = await hostAPI.submitVerification(verificationData);
            setHost((prev) =>
                prev ? { ...prev, ...response.data } : response.data
            );
            return response.data;
        } catch (err: any) {
            console.error("Error submitting verification:", err);
            throw new Error(
                err.response?.data?.error || "Failed to submit verification"
            );
        }
    };

    return {
        host,
        stats,
        properties,
        bookings,
        earnings,
        loading,
        error,
        refreshData,
        refreshBookings, // Add this for the dashboard component
        updateProperty,
        deleteProperty,
        togglePropertyStatus,
        createProperty,
        updateHostProfile,
        submitVerification,
    };
};
