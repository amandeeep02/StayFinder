import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import admin from "../config/firebase-admin";

interface AuthRequest extends Request {
    user?: any;
}

export const authCheck = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
    }

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
        res.status(500).json({ error: "JWT secret not configured" });
        return;
    }

    // Verify custom JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Auth check error:", err);
            res.status(401).json({ error: "Invalid token" });
            return;
        }

        req.user = decoded;
        next();
    });
};

export const verifyFirebaseToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token =
            req.headers.authorization?.split(" ")[1] || req.body.token;

        if (!token) {
            res.status(401).json({ error: "No Firebase token provided" });
            return;
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        next();
    } catch (error) {
        console.error("Firebase token verification error:", error);
        res.status(401).json({ error: "Invalid Firebase token" });
        return;
    }
};
