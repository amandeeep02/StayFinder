import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

interface AuthRequest extends Request {
    user?: any;
}

export const firebaseLogin = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { email, firstName, lastName } = req.body;

        // Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            res.status(500).json({ error: "JWT secret not configured" });
            return;
        }

        // Create or find user
        let user = await User.findOneAndUpdate(
            { email },
            {
                email,
                firstName,
                lastName,
                role: "user", // default role
            },
            { new: true, upsert: true }
        );

        // Generate custom JWT
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Firebase login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

export const getCurrentUser = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ error: "Failed to get user" });
    }
};
