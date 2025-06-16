import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model";
import { verifyAccessToken } from "../utils/jwt.utils";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        _id: string;
        role: string;
        email: string;
    };
}

export const authCheck = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Access token required" });
            return;
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.userId).select(
                "-password"
            );

            if (!user) {
                res.status(401).json({ error: "User not found" });
                return;
            }

            const userId = (user._id as any).toString();
            req.user = {
                id: userId,
                _id: userId,
                role: user.role,
                email: user.email,
            };

            next();
        } catch (jwtError) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const requireHost = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    if (req.user.role !== "host" && req.user.role !== "admin") {
        res.status(403).json({ error: "Host access required" });
        return;
    }

    next();
};

export const requireAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    if (req.user.role !== "admin") {
        res.status(403).json({ error: "Admin access required" });
        return;
    }

    next();
};
