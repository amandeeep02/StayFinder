import { Booking } from "../models/booking.model";
import { Property } from "../models/property.model";
import { Host } from "../models/host.model";
import {
    IAvailabilityCheck,
    IPriceCalculation,
} from "../interfaces/booking.interface";

export class BookingService {
    static async checkAvailability({
        propertyId,
        checkInDate,
        checkOutDate,
        excludeBookingId,
    }: IAvailabilityCheck): Promise<boolean> {
        try {
            const query: any = {
                property: propertyId,
                status: { $in: ["confirmed", "pending"] },
                $or: [
                    {
                        checkInDate: { $lt: checkOutDate },
                        checkOutDate: { $gt: checkInDate },
                    },
                ],
            };

            if (excludeBookingId) {
                query._id = { $ne: excludeBookingId };
            }

            const conflictingBooking = await Booking.findOne(query);
            return !conflictingBooking;
        } catch (error) {
            console.error("Error checking availability:", error);
            return false;
        }
    }

    static async calculatePrice(
        propertyId: string,
        checkInDate: Date,
        checkOutDate: Date
    ): Promise<IPriceCalculation | null> {
        try {
            const property = await Property.findById(propertyId);
            if (!property) return null;

            const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
            const totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

            const pricePerNight = property.pricePerNight;
            const subtotal = pricePerNight * totalNights;

            // Calculate service fee (typically 3-5% of subtotal)
            const serviceFeeRate = 0.03; // 3%
            const serviceFee =
                Math.round(subtotal * serviceFeeRate * 100) / 100;

            // Calculate taxes (typically 10-15% of subtotal)
            const taxRate = 0.12; // 12%
            const taxes = Math.round(subtotal * taxRate * 100) / 100;

            const totalAmount = subtotal + serviceFee + taxes;

            return {
                pricePerNight,
                totalNights,
                subtotal,
                serviceFee,
                taxes,
                totalAmount,
            };
        } catch (error) {
            console.error("Error calculating price:", error);
            return null;
        }
    }

    static async updateHostStats(hostId: string): Promise<void> {
        try {
            const bookings = await Booking.find({ host: hostId });
            const completedBookings = bookings.filter(
                (b) => b.status === "completed"
            );
            const totalRevenue = completedBookings.reduce(
                (sum, b) => sum + b.totalAmount,
                0
            );

            // Update host earnings
            const host = await Host.findOne({ user: hostId });
            if (host) {
                host.earnings.totalEarnings = totalRevenue;

                // Calculate current month earnings
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                const currentMonthBookings = completedBookings.filter((b) => {
                    const bookingDate = new Date(b.createdAt!);
                    return (
                        bookingDate.getMonth() === currentMonth &&
                        bookingDate.getFullYear() === currentYear
                    );
                });

                host.earnings.currentMonthEarnings =
                    currentMonthBookings.reduce(
                        (sum, b) => sum + b.totalAmount,
                        0
                    );

                await host.save();
            }
        } catch (error) {
            console.error("Error updating host stats:", error);
        }
    }

    static async getBookingStats(userId: string, isHost: boolean = false) {
        try {
            const query = isHost ? { host: userId } : { guest: userId };

            const bookings = await Booking.find(query);

            const stats = {
                total: bookings.length,
                pending: bookings.filter((b) => b.status === "pending").length,
                confirmed: bookings.filter((b) => b.status === "confirmed")
                    .length,
                completed: bookings.filter((b) => b.status === "completed")
                    .length,
                cancelled: bookings.filter((b) => b.status === "cancelled")
                    .length,
                totalSpent: bookings
                    .filter((b) => b.status === "completed")
                    .reduce((sum, b) => sum + b.totalAmount, 0),
            };

            return stats;
        } catch (error) {
            console.error("Error getting booking stats:", error);
            return null;
        }
    }

    static async sendBookingNotification(bookingId: string, type: string) {
        // Placeholder for notification service
        // This would integrate with email/SMS services
        console.log(`Sending ${type} notification for booking ${bookingId}`);
    }

    static async processAutomaticCancellation() {
        try {
            // Cancel bookings that are pending for more than 24 hours
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - 24);

            const pendingBookings = await Booking.find({
                status: "pending",
                createdAt: { $lt: cutoffDate },
            });

            for (const booking of pendingBookings) {
                booking.status = "cancelled";
                booking.cancellationReason =
                    "Automatic cancellation due to non-payment";
                booking.cancellationDate = new Date();
                await booking.save();

                await this.sendBookingNotification(
                    booking._id,
                    "auto_cancelled"
                );
            }

            return pendingBookings.length;
        } catch (error) {
            console.error("Error processing automatic cancellations:", error);
            return 0;
        }
    }
}
