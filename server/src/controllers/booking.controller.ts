import { Response } from "express";
import { Booking } from "../models/booking.model";
import { Property } from "../models/property.model";
import { Host } from "../models/host.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { BookingService } from "../services/booking.service";
import {
    ICreateBookingRequest,
    IUpdateBookingRequest,
    IBookingSearchQuery,
} from "../interfaces/booking.interface";

// Create booking
export const createBooking = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const bookingData = req.body as ICreateBookingRequest;
        const {
            propertyId,
            checkInDate,
            checkOutDate,
            numberOfGuests,
            guestDetails,
            specialRequests,
        } = bookingData;

        // Get property details
        const property = await Property.findById(propertyId).populate(
            "host",
            "firstName lastName email"
        );
        if (!property) {
            res.status(404).json({ error: "Property not found" });
            return;
        }

        if (!property.isActive || !property.isVerified) {
            res.status(400).json({
                error: "Property is not available for booking",
            });
            return;
        }

        // Check if user is trying to book their own property
        if (property.host.toString() === req.user._id) {
            res.status(400).json({
                error: "You cannot book your own property",
            });
            return;
        }

        // Validate guest capacity
        if (numberOfGuests > property.maxGuests) {
            res.status(400).json({
                error: `Property can accommodate maximum ${property.maxGuests} guests`,
            });
            return;
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // Check availability
        const isAvailable = await BookingService.checkAvailability({
            propertyId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
        });

        if (!isAvailable) {
            res.status(400).json({
                error: "Property is not available for selected dates",
            });
            return;
        }

        // Calculate pricing
        const pricing = await BookingService.calculatePrice(
            propertyId,
            checkIn,
            checkOut
        );
        if (!pricing) {
            res.status(500).json({ error: "Failed to calculate pricing" });
            return;
        }

        // Get host details for cancellation policy
        const host = await Host.findOne({ user: property.host });
        const cancellationPolicy = host?.cancellationPolicy || "moderate";

        // Create booking
        const booking = new Booking({
            guest: req.user._id,
            property: propertyId,
            host: property.host,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests,
            ...pricing,
            guestDetails,
            specialRequests,
            cancellationPolicy,
        });

        await booking.save();
        await booking.populate([
            { path: "guest", select: "firstName lastName email avatar" },
            { path: "property", select: "title images location" },
            { path: "host", select: "firstName lastName avatar phone" },
        ]);

        // Send notification to host
        await BookingService.sendBookingNotification(
            booking._id,
            "new_booking"
        );

        res.status(201).json({
            message: "Booking created successfully",
            booking: booking.toJSON(),
        });
    } catch (error) {
        console.error("Create booking error:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
};

// Get booking by ID
export const getBookingById = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const { id } = req.params;

        const booking = await Booking.findById(id).populate([
            { path: "guest", select: "firstName lastName email avatar" },
            { path: "property", select: "title images location pricePerNight" },
            { path: "host", select: "firstName lastName avatar phone" },
        ]);

        if (!booking) {
            res.status(404).json({ error: "Booking not found" });
            return;
        }

        // Check if user has access to this booking
        const hasAccess =
            booking.guest.toString() === req.user._id ||
            booking.host.toString() === req.user._id ||
            req.user.role === "admin";

        if (!hasAccess) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        res.status(200).json(booking.toJSON());
    } catch (error) {
        console.error("Get booking by ID error:", error);
        res.status(500).json({ error: "Failed to get booking" });
    }
};

// Get user bookings (guest bookings)
export const getUserBookings = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const skip = (page - 1) * limit;

        const filter: any = { guest: req.user._id };
        if (status) filter.status = status;

        const bookings = await Booking.find(filter)
            .populate([
                { path: "property", select: "title images location" },
                { path: "host", select: "firstName lastName avatar" },
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments(filter);

        res.status(200).json({
            bookings: bookings.map((booking) => booking.toJSON()),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get user bookings error:", error);
        res.status(500).json({ error: "Failed to get bookings" });
    }
};

// Get host bookings
export const getHostBookings = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const skip = (page - 1) * limit;

        const filter: any = { host: req.user._id };
        if (status) filter.status = status;

        const bookings = await Booking.find(filter)
            .populate([
                { path: "guest", select: "firstName lastName email avatar" },
                { path: "property", select: "title images location" },
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments(filter);

        res.status(200).json({
            bookings: bookings.map((booking) => booking.toJSON()),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get host bookings error:", error);
        res.status(500).json({ error: "Failed to get bookings" });
    }
};

// Update booking status
export const updateBookingStatus = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const { id } = req.params;
        const updates = req.body as IUpdateBookingRequest;

        const booking = await Booking.findById(id);
        if (!booking) {
            res.status(404).json({ error: "Booking not found" });
            return;
        }

        // Check permissions
        const isHost = booking.host.toString() === req.user._id;
        const isGuest = booking.guest.toString() === req.user._id;
        const isAdmin = req.user.role === "admin";

        if (!isHost && !isGuest && !isAdmin) {
            res.status(403).json({ error: "Access denied" });
            return;
        }

        // Validate status transitions
        if (updates.status) {
            if (updates.status === "confirmed" && !isHost && !isAdmin) {
                res.status(403).json({
                    error: "Only host can confirm bookings",
                });
                return;
            }

            if (updates.status === "rejected" && !isHost && !isAdmin) {
                res.status(403).json({
                    error: "Only host can reject bookings",
                });
                return;
            }

            if (updates.status === "cancelled") {
                if (!booking.canBeCancelled()) {
                    res.status(400).json({
                        error: "Booking cannot be cancelled",
                    });
                    return;
                }

                booking.cancellationDate = new Date();
                booking.refundAmount = booking.calculateRefund();
            }
        }

        // Update booking
        Object.assign(booking, updates);
        await booking.save();

        await booking.populate([
            { path: "guest", select: "firstName lastName email avatar" },
            { path: "property", select: "title images location" },
            { path: "host", select: "firstName lastName avatar phone" },
        ]);

        // Send notifications
        if (updates.status) {
            await BookingService.sendBookingNotification(
                booking._id,
                `booking_${updates.status}`
            );
        }

        // Update host stats if booking confirmed
        if (updates.status === "confirmed") {
            await BookingService.updateHostStats(booking.host.toString());
        }

        res.status(200).json({
            message: "Booking updated successfully",
            booking: booking.toJSON(),
        });
    } catch (error) {
        console.error("Update booking status error:", error);
        res.status(500).json({ error: "Failed to update booking" });
    }
};

// Check availability
export const checkAvailability = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { propertyId, checkInDate, checkOutDate, excludeBookingId } =
            req.query;

        const isAvailable = await BookingService.checkAvailability({
            propertyId: propertyId as string,
            checkInDate: new Date(checkInDate as string),
            checkOutDate: new Date(checkOutDate as string),
            excludeBookingId: excludeBookingId as string,
        });

        res.status(200).json({ available: isAvailable });
    } catch (error) {
        console.error("Check availability error:", error);
        res.status(500).json({ error: "Failed to check availability" });
    }
};

// Calculate booking price
export const calculatePrice = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { propertyId, checkInDate, checkOutDate } = req.query;

        const pricing = await BookingService.calculatePrice(
            propertyId as string,
            new Date(checkInDate as string),
            new Date(checkOutDate as string)
        );

        if (!pricing) {
            res.status(404).json({
                error: "Property not found or pricing unavailable",
            });
            return;
        }

        res.status(200).json(pricing);
    } catch (error) {
        console.error("Calculate price error:", error);
        res.status(500).json({ error: "Failed to calculate price" });
    }
};

// Get booking statistics
export const getBookingStats = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const isHost = req.query.type === "host";
        const stats = await BookingService.getBookingStats(
            req.user._id,
            isHost
        );

        if (!stats) {
            res.status(500).json({ error: "Failed to get booking statistics" });
            return;
        }

        res.status(200).json(stats);
    } catch (error) {
        console.error("Get booking stats error:", error);
        res.status(500).json({ error: "Failed to get booking statistics" });
    }
};

// Get all bookings (admin only)
export const getAllBookings = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        const {
            status,
            paymentStatus,
            dateFrom,
            dateTo,
            propertyId,
            guestId,
            hostId,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query as IBookingSearchQuery;

        const skip = (Number(page) - 1) * Number(limit);
        const filter: any = {};

        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (propertyId) filter.property = propertyId;
        if (guestId) filter.guest = guestId;
        if (hostId) filter.host = hostId;

        if (dateFrom || dateTo) {
            filter.checkInDate = {};
            if (dateFrom) filter.checkInDate.$gte = new Date(dateFrom);
            if (dateTo) filter.checkInDate.$lte = new Date(dateTo);
        }

        const sortObj: any = {};
        sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

        const bookings = await Booking.find(filter)
            .populate([
                { path: "guest", select: "firstName lastName email avatar" },
                { path: "property", select: "title images location" },
                { path: "host", select: "firstName lastName avatar" },
            ])
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit));

        const total = await Booking.countDocuments(filter);

        res.status(200).json({
            bookings: bookings.map((booking) => booking.toJSON()),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("Get all bookings error:", error);
        res.status(500).json({ error: "Failed to get bookings" });
    }
};
