import { IUser } from "../interfaces/user.interface";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema<IUser>(
    {
        firstName: {
            type: String,
            trim: true,
            required: true,
        },
        lastName: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
        },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);


