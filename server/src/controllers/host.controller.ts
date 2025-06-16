import { Response } from "express";
import { Host } from "../models/host.model";
import { User } from "../models/user.model";
import { Property } from "../models/property.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
    ICreateHostProfileRequest,
    IUpdateHostProfileRequest,
    IHostVerification,
} from "../interfaces/host.interface";

// Create host profile
export const createHostProfile = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const existingHost = await Host.findOne({ user: req.user._id });
        if (existingHost) {
            res.status(400).json({ error: "Host profile already exists" });
            return;
        }

        await User.findByIdAndUpdate(req.user._id, { role: "host" });

        const hostData = req.body as ICreateHostProfileRequest;

        const host = new Host({
            ...hostData,
            user: req.user._id,
            achievements: [
                {
                    type: "new_host",
                    title: "New Host",
                    description: "Welcome to hosting!",
                    earnedAt: new Date(),
                    isActive: true,
                },
            ],
        });

        await host.save();
        await host.populate(
            "user",
            "firstName lastName email avatar isVerified"
        );

        res.status(201).json({
            message: "Host profile created successfully",
            host: host.toJSON(),
        });
    } catch (error) {
        console.error("Create host profile error:", error);
        res.status(500).json({ error: "Failed to create host profile" });
    }
};

// Get host profile
export const getHostProfile = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const host = await Host.findOne({ user: req.user._id }).populate(
            "user",
            "firstName lastName email avatar isVerified phone bio"
        );

        if (!host) {
            res.status(404).json({ error: "Host profile not found" });
            return;
        }

        res.status(200).json(host.toJSON());
    } catch (error) {
        console.error("Get host profile error:", error);
        res.status(500).json({ error: "Failed to get host profile" });
    }
};

// Get host profile by ID (public)
export const getHostById = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const host = await Host.findById(id).populate(
            "user",
            "firstName lastName avatar isVerified bio createdAt"
        );

        if (!host || !host.isActive) {
            res.status(404).json({ error: "Host not found" });
            return;
        }

        const stats = await host.calculateStats();

        res.status(200).json({
            ...host.toJSON(),
            stats,
        });
    } catch (error) {
        console.error("Get host by ID error:", error);
        res.status(500).json({ error: "Failed to get host" });
    }
};

// Update host profile
export const updateHostProfile = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const updates = req.body as IUpdateHostProfileRequest;

        const host = await Host.findOneAndUpdate(
            { user: req.user._id },
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate("user", "firstName lastName email avatar isVerified");

        if (!host) {
            res.status(404).json({ error: "Host profile not found" });
            return;
        }

        res.status(200).json({
            message: "Host profile updated successfully",
            host: host.toJSON(),
        });
    } catch (error) {
        console.error("Update host profile error:", error);
        res.status(500).json({ error: "Failed to update host profile" });
    }
};

// Get host dashboard stats
export const getHostDashboard = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const host = await Host.findOne({ user: req.user._id });
        if (!host) {
            res.status(404).json({ error: "Host profile not found" });
            return;
        }

        const properties = await Property.find({ host: req.user._id }).select(
            "title isActive isVerified averageRating totalReviews pricePerNight"
        );

        const stats = await host.calculateStats();

        res.status(200).json({
            host: host.toJSON(),
            properties,
            stats,
            recentActivities: [],
            earnings: host.earnings,
        });
    } catch (error) {
        console.error("Get host dashboard error:", error);
        res.status(500).json({ error: "Failed to get host dashboard" });
    }
};

// Submit host verification
export const submitHostVerification = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const { type, documents, notes } = req.body;

        const host = await Host.findOne({ user: req.user._id });
        if (!host) {
            res.status(404).json({ error: "Host profile not found" });
            return;
        }

        const existingVerification = host.verifications.find(
            (v) => v.type === type
        );

        if (existingVerification && existingVerification.status === "pending") {
            res.status(400).json({
                error: "Verification already submitted and pending",
            });
            return;
        }

        const verification: IHostVerification = {
            type,
            status: "pending",
            documents: documents || [],
            notes,
        };

        if (existingVerification) {
            const index = host.verifications.findIndex((v) => v.type === type);
            if (index !== -1) {
                host.verifications[index] = verification;
            }
        } else {
            host.verifications.push(verification);
        }

        await host.save();

        res.status(200).json({
            message: "Verification submitted successfully",
            verification,
        });
    } catch (error) {
        console.error("Submit host verification error:", error);
        res.status(500).json({ error: "Failed to submit verification" });
    }
};

// Get all hosts (admin only)
export const getAllHosts = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const sortBy = (req.query.sortBy as string) || "createdAt";
        const sortOrder = (req.query.sortOrder as string) || "desc";
        const skip = (page - 1) * limit;

        const sortObj: Record<string, 1 | -1> = {};
        sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

        const hosts = await Host.find()
            .populate("user", "firstName lastName email avatar isVerified")
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        const total = await Host.countDocuments();

        const hostsWithStats = await Promise.all(
            hosts.map(async (host) => {
                const stats = await host.calculateStats();
                return {
                    ...host.toJSON(),
                    stats,
                };
            })
        );

        res.status(200).json({
            hosts: hostsWithStats,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get all hosts error:", error);
        res.status(500).json({ error: "Failed to get hosts" });
    }
};

// Verify host (admin only)
export const verifyHost = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        const { id } = req.params;
        const { verificationType, status, notes } = req.body;

        const host = await Host.findById(id);
        if (!host) {
            res.status(404).json({ error: "Host not found" });
            return;
        }

        const verification = host.verifications.find(
            (v) => v.type === verificationType
        );
        if (!verification) {
            res.status(404).json({ error: "Verification not found" });
            return;
        }

        verification.status = status;
        verification.notes = notes;
        if (status === "verified") {
            verification.verifiedAt = new Date();
        }

        await host.save();

        res.status(200).json({
            message: `Host verification ${status}`,
            verification,
        });
    } catch (error) {
        console.error("Verify host error:", error);
        res.status(500).json({ error: "Failed to verify host" });
    }
};

// Update superhost status (admin only)
export const updateSuperhostStatus = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        const { id } = req.params;
        const { isSuperhost } = req.body;

        const host = await Host.findById(id);
        if (!host) {
            res.status(404).json({ error: "Host not found" });
            return;
        }

        host.isSuperhost = isSuperhost;

        const superhostAchievement = host.achievements.find(
            (a) => a.type === "superhost"
        );
        if (isSuperhost && !superhostAchievement) {
            host.achievements.push({
                type: "superhost",
                title: "Superhost",
                description: "Recognized for exceptional hosting",
                earnedAt: new Date(),
                isActive: true,
            });
        } else if (!isSuperhost && superhostAchievement) {
            superhostAchievement.isActive = false;
        }

        await host.save();

        res.status(200).json({
            message: `Host ${
                isSuperhost ? "promoted to" : "removed from"
            } superhost status`,
            host: host.toJSON(),
        });
    } catch (error) {
        console.error("Update superhost status error:", error);
        res.status(500).json({ error: "Failed to update superhost status" });
    }
};

// Delete host profile
export const deleteHostProfile = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        const activeProperties = await Property.countDocuments({
            host: req.user._id,
            isActive: true,
        });

        if (activeProperties > 0) {
            res.status(400).json({
                error: "Cannot delete host profile with active properties. Please deactivate all properties first.",
            });
            return;
        }

        await Host.findOneAndDelete({ user: req.user._id });
        await User.findByIdAndUpdate(req.user._id, { role: "user" });

        res.status(200).json({ message: "Host profile deleted successfully" });
    } catch (error) {
        console.error("Delete host profile error:", error);
        res.status(500).json({ error: "Failed to delete host profile" });
    }
};
