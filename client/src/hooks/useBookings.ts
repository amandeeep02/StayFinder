import { useState, useEffect } from "react";
import type { Booking, BookingFormData, BookingStats } from "@/types/Booking";
import { bookingsAPI } from "@/utils/api";

export const useBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<BookingStats>({
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
    });

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);

                // Fetch user's bookings from API
                const response = await bookingsAPI.getUserBookings();
                const bookingsData =
                    response.data.bookings || response.data || [];

                setBookings(bookingsData);

                // Calculate stats from fetched data
                const newStats = calculateStats(bookingsData);
                setStats(newStats);

                setError(null);
            } catch (err: any) {
                console.error("Error fetching bookings:", err);
                setError(
                    err.response?.data?.error || "Failed to fetch bookings"
                );

                // Reset data on error
                setBookings([]);
                setStats({
                    total: 0,
                    upcoming: 0,
                    completed: 0,
                    cancelled: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Helper function to calculate booking statistics
    const calculateStats = (bookingsData: Booking[]): BookingStats => {
        const now = new Date();

        return {
            total: bookingsData.length,
            upcoming: bookingsData.filter(
                (b) => b.status === "confirmed" && new Date(b.checkIn) > now
            ).length,
            completed: bookingsData.filter((b) => b.status === "completed")
                .length,
            cancelled: bookingsData.filter((b) => b.status === "cancelled")
                .length,
        };
    };

    const createBooking = async (
        bookingData: BookingFormData & { propertyId: string }
    ) => {
        try {
            const response = await bookingsAPI.create(bookingData);
            const newBooking = response.data.booking || response.data;

            setBookings((prev) => [...prev, newBooking]);

            // Update stats
            const updatedBookings = [...bookings, newBooking];
            setStats(calculateStats(updatedBookings));

            setError(null);
            return newBooking;
        } catch (err: any) {
            console.error("Error creating booking:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to create booking";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const updateBookingStatus = async (
        bookingId: string,
        status: string,
        data?: any
    ) => {
        try {
            const response = await bookingsAPI.update(bookingId, {
                status,
                ...data,
            });
            const updatedBooking = response.data.booking || response.data;

            setBookings((prev) =>
                prev.map((booking) =>
                    booking._id === bookingId
                        ? { ...booking, ...updatedBooking }
                        : booking
                )
            );

            // Update stats
            const updatedBookings = bookings.map((booking) =>
                booking._id === bookingId
                    ? { ...booking, ...updatedBooking }
                    : booking
            );
            setStats(calculateStats(updatedBookings));

            setError(null);
            return updatedBooking;
        } catch (err: any) {
            console.error("Error updating booking status:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to update booking";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const cancelBooking = async (bookingId: string, reason?: string) => {
        try {
            await updateBookingStatus(bookingId, "cancelled", {
                cancellationReason: reason,
            });
        } catch (err) {
            throw err; // Re-throw to allow component to handle
        }
    };

    const confirmBooking = async (bookingId: string) => {
        try {
            await updateBookingStatus(bookingId, "confirmed");
        } catch (err) {
            throw err;
        }
    };

    const completeBooking = async (bookingId: string) => {
        try {
            await updateBookingStatus(bookingId, "completed");
        } catch (err) {
            throw err;
        }
    };

    const getBookingById = async (bookingId: string) => {
        try {
            const response = await bookingsAPI.getById(bookingId);
            return response.data.booking || response.data;
        } catch (err: any) {
            console.error("Error fetching booking by ID:", err);
            throw new Error(
                err.response?.data?.error || "Failed to fetch booking"
            );
        }
    };

    const checkAvailability = async (params: {
        propertyId: string;
        checkIn: string;
        checkOut: string;
    }) => {
        try {
            const response = await bookingsAPI.checkAvailability(params);
            return response.data.available || false;
        } catch (err: any) {
            console.error("Error checking availability:", err);
            throw new Error(
                err.response?.data?.error || "Failed to check availability"
            );
        }
    };

    const calculatePrice = async (params: {
        propertyId: string;
        checkIn: string;
        checkOut: string;
        guests?: number;
    }) => {
        try {
            const response = await bookingsAPI.calculatePrice(params);
            return response.data;
        } catch (err: any) {
            console.error("Error calculating price:", err);
            throw new Error(
                err.response?.data?.error || "Failed to calculate price"
            );
        }
    };

    const refreshBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingsAPI.getUserBookings();
            const bookingsData = response.data.bookings || response.data || [];

            setBookings(bookingsData);
            setStats(calculateStats(bookingsData));
            setError(null);
        } catch (err: any) {
            console.error("Error refreshing bookings:", err);
            setError(err.response?.data?.error || "Failed to refresh bookings");
        } finally {
            setLoading(false);
        }
    };

    const getBookingStats = async () => {
        try {
            const response = await bookingsAPI.getStats();
            return response.data;
        } catch (err: any) {
            console.error("Error fetching booking stats:", err);
            throw new Error(
                err.response?.data?.error || "Failed to fetch booking stats"
            );
        }
    };

    return {
        bookings,
        loading,
        error,
        stats,
        createBooking,
        cancelBooking,
        confirmBooking,
        completeBooking,
        updateBookingStatus,
        getBookingById,
        checkAvailability,
        calculatePrice,
        refreshBookings,
        getBookingStats,
    };
};
