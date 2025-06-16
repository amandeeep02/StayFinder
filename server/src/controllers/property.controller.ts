import { Response } from "express";
import { Property } from "../models/property.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
    ICreatePropertyRequest,
    IUpdatePropertyRequest,
    IPropertySearchQuery,
} from "../interfaces/property.interface";

// Create property
export const createProperty = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        // Check if user is host or admin
        if (!["host", "admin"].includes(req.user.role)) {
            res.status(403).json({
                error: "Only hosts and admins can create properties",
            });
            return;
        }

        const propertyData = req.body as ICreatePropertyRequest;

        // Transform amenities from strings to objects if needed
        if (propertyData.amenities && Array.isArray(propertyData.amenities)) {
            propertyData.amenities = propertyData.amenities.map((amenity: any) => {
                if (typeof amenity === 'string') {
                    return {
                        name: amenity,
                        category: 'basic' // default category
                    };
                }
                return amenity;
            });
        }

        const property = new Property({
            ...propertyData,
            host: req.user._id,
        });

        await property.save();
        await property.populate("host", "firstName lastName avatar isVerified");

        res.status(201).json({
            message: "Property created successfully",
            property: property.toJSON(),
        });
    } catch (error) {
        console.error("Create property error:", error);
        res.status(500).json({ error: "Failed to create property" });
    }
};

// Get all properties with search and filtering
export const getProperties = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const {
            city,
            state,
            country,
            propertyType,
            minPrice,
            maxPrice,
            maxGuests,
            bedrooms,
            bathrooms,
            amenities,
            page = 1,
            limit = 10,
            sortBy = "newest",
            sortOrder = "desc",
        } = req.query as IPropertySearchQuery;

        // Build filter object
        const filter: any = {
            isActive: true,
            isVerified: true,
        };

        if (city) filter["location.city"] = new RegExp(city, "i");
        if (state) filter["location.state"] = new RegExp(state, "i");
        if (country) filter["location.country"] = new RegExp(country, "i");
        if (propertyType) filter.propertyType = propertyType;
        if (maxGuests) filter.maxGuests = { $gte: maxGuests };
        if (bedrooms) filter.bedrooms = { $gte: bedrooms };
        if (bathrooms) filter.bathrooms = { $gte: bathrooms };

        // Price range filter
        if (minPrice || maxPrice) {
            filter.pricePerNight = {};
            if (minPrice) filter.pricePerNight.$gte = minPrice;
            if (maxPrice) filter.pricePerNight.$lte = maxPrice;
        }

        // Amenities filter
        if (amenities && Array.isArray(amenities)) {
            filter["amenities.name"] = { $in: amenities };
        }

        // Build sort object
        let sortObj: any = {};
        switch (sortBy) {
            case "price":
                sortObj.pricePerNight = sortOrder === "asc" ? 1 : -1;
                break;
            case "rating":
                sortObj.averageRating = sortOrder === "asc" ? 1 : -1;
                break;
            case "oldest":
                sortObj.createdAt = 1;
                break;
            case "newest":
            default:
                sortObj.createdAt = -1;
                break;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const properties = await Property.find(filter)
            .populate("host", "firstName lastName avatar isVerified")
            .sort(sortObj)
            .skip(skip)
            .limit(Number(limit));

        const total = await Property.countDocuments(filter);

        res.status(200).json({
            properties: properties.map((property) => property.toJSON()),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("Get properties error:", error);
        res.status(500).json({ error: "Failed to get properties" });
    }
};

// Get property by ID
export const getPropertyById = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const property = await Property.findById(id).populate(
            "host",
            "firstName lastName avatar isVerified phone email"
        );

        if (!property) {
            res.status(404).json({ error: "Property not found" });
            return;
        }

        res.status(200).json(property.toJSON());
    } catch (error) {
        console.error("Get property by ID error:", error);
        res.status(500).json({ error: "Failed to get property" });
    }
};

// Get properties by host
export const getPropertiesByHost = async (
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
        const skip = (page - 1) * limit;

        const properties = await Property.find({ host: req.user._id })
            .populate("host", "firstName lastName avatar isVerified")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Property.countDocuments({ host: req.user._id });

        res.status(200).json({
            properties: properties.map((property) => property.toJSON()),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get properties by host error:", error);
        res.status(500).json({ error: "Failed to get properties" });
    }
};

// Update property
export const updateProperty = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const { id } = req.params;
        const updates = req.body as IUpdatePropertyRequest;

        // Transform amenities from strings to objects if needed
        if (updates.amenities && Array.isArray(updates.amenities)) {
            updates.amenities = updates.amenities.map((amenity: any) => {
                if (typeof amenity === 'string') {
                    return {
                        name: amenity,
                        category: 'basic' // default category
                    };
                }
                return amenity;
            });
        }

        const property = await Property.findById(id);

        if (!property) {
            res.status(404).json({ error: "Property not found" });
            return;
        }

        // Check if user owns the property or is admin
        if (
            property.host.toString() !== req.user._id &&
            req.user.role !== "admin"
        ) {
            res.status(403).json({
                error: "You can only update your own properties",
            });
            return;
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate("host", "firstName lastName avatar isVerified");

        res.status(200).json({
            message: "Property updated successfully",
            property: updatedProperty?.toJSON(),
        });
    } catch (error) {
        console.error("Update property error:", error);
        res.status(500).json({ error: "Failed to update property" });
    }
};

// Delete property
export const deleteProperty = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const { id } = req.params;

        const property = await Property.findById(id);

        if (!property) {
            res.status(404).json({ error: "Property not found" });
            return;
        }

        // Check if user owns the property or is admin
        if (
            property.host.toString() !== req.user._id &&
            req.user.role !== "admin"
        ) {
            res.status(403).json({
                error: "You can only delete your own properties",
            });
            return;
        }

        await Property.findByIdAndDelete(id);

        res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
        console.error("Delete property error:", error);
        res.status(500).json({ error: "Failed to delete property" });
    }
};

// Toggle property active status
export const togglePropertyStatus = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const { id } = req.params;

        const property = await Property.findById(id);

        if (!property) {
            res.status(404).json({ error: "Property not found" });
            return;
        }

        // Check if user owns the property or is admin
        if (
            property.host.toString() !== req.user._id &&
            req.user.role !== "admin"
        ) {
            res.status(403).json({
                error: "You can only modify your own properties",
            });
            return;
        }

        property.isActive = !property.isActive;
        await property.save();

        res.status(200).json({
            message: `Property ${
                property.isActive ? "activated" : "deactivated"
            } successfully`,
            property: property.toJSON(),
        });
    } catch (error) {
        console.error("Toggle property status error:", error);
        res.status(500).json({ error: "Failed to toggle property status" });
    }
};

// Admin: Verify property
export const verifyProperty = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        const { id } = req.params;
        const { isVerified } = req.body;

        const property = await Property.findByIdAndUpdate(
            id,
            { isVerified, updatedAt: new Date() },
            { new: true }
        ).populate("host", "firstName lastName avatar isVerified");

        if (!property) {
            res.status(404).json({ error: "Property not found" });
            return;
        }

        res.status(200).json({
            message: `Property ${
                isVerified ? "verified" : "unverified"
            } successfully`,
            property: property.toJSON(),
        });
    } catch (error) {
        console.error("Verify property error:", error);
        res.status(500).json({ error: "Failed to verify property" });
    }
};

// Search properties with text search
export const searchProperties = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        if (!q) {
            res.status(400).json({ error: "Search query is required" });
            return;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const properties = await Property.find({
            $text: { $search: q as string },
            isActive: true,
            isVerified: true,
        })
            .populate("host", "firstName lastName avatar isVerified")
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(Number(limit));

        const total = await Property.countDocuments({
            $text: { $search: q as string },
            isActive: true,
            isVerified: true,
        });

        res.status(200).json({
            properties: properties.map((property) => property.toJSON()),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("Search properties error:", error);
        res.status(500).json({ error: "Failed to search properties" });
    }
};
