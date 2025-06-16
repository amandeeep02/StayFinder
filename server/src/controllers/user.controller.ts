import { Request, Response } from "express";
import {User} from "../models/user.model";

interface AuthRequest extends Request {
    user?: any;
}

export const createOrUpdateUser = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { email, firstName, lastName, role } = req.body;

        const user = await User.findOneAndUpdate(
            { email },
            {
                email,
                firstName,
                lastName,
                role: role || "user",
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Create/Update user error:", error);
        res.status(500).json({ error: "Failed to create/update user" });
    }
};

export const getAllUsers = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ error: "Failed to get users" });
    }
};

export const getUserById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error("Get user by ID error:", error);
        res.status(500).json({ error: "Failed to get user" });
    }
};

export const updateUser = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(id, updates, {
            new: true,
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
};

export const deleteUser = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
};
