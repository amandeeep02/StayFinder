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

                // Fetch host profile first
                const hostRes = await hostAPI.getProfile();
                setHost(hostRes.data);

                // Then fetch other data in parallel
                const [statsRes, propertiesRes, bookingsRes] =
                    await Promise.all([
                        hostAPI.getDashboard(), // This matches your server route: /host/dashboard/stats
                        propertiesAPI.getByHost(), // This matches: /properties/host/my-properties
                        bookingsAPI.getHostBookings(), // This matches: /bookings/host/bookings
                    ]);

                setStats(statsRes.data);
                setProperties(
                    propertiesRes.data.properties || propertiesRes.data || []
                );
                setBookings(
                    bookingsRes.data.bookings || bookingsRes.data || []
                );

                // Extract earnings data from stats or bookings if available
                if (statsRes.data?.earnings) {
                    setEarnings(statsRes.data.earnings);
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
                const month = new Date(booking.checkIn)
                    .toISOString()
                    .substring(0, 7); // YYYY-MM format
                const currentEarnings = earningsMap.get(month) || 0;
                earningsMap.set(
                    month,
                    currentEarnings + (booking.totalPrice || 0)
                );
            }
        });

        return Array.from(earningsMap.entries()).map(([month, amount]) => ({
            month,
            earnings: amount,
            bookings: bookings.filter(
                (b) =>
                    new Date(b.checkIn).toISOString().substring(0, 7) ===
                        month &&
                    (b.status === "confirmed" || b.status === "completed")
            ).length,
        }));
    };

    const refreshData = async () => {
        try {
            setLoading(true);

            const [hostRes, statsRes, propertiesRes, bookingsRes] =
                await Promise.all([
                    hostAPI.getProfile(),
                    hostAPI.getDashboard(),
                    propertiesAPI.getByHost(),
                    bookingsAPI.getHostBookings(),
                ]);

            setHost(hostRes.data);
            setStats(statsRes.data);
            setProperties(
                propertiesRes.data.properties || propertiesRes.data || []
            );
            setBookings(bookingsRes.data.bookings || bookingsRes.data || []);

            if (statsRes.data?.earnings) {
                setEarnings(statsRes.data.earnings);
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
        updateProperty,
        deleteProperty,
        togglePropertyStatus,
        createProperty,
        updateHostProfile,
        submitVerification,
    };
};
