import express from "express";
import {
    createOrUpdateUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} from "../controllers/user.controller";
import { authCheck } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/user", authCheck, createOrUpdateUser);
router.get("/users", authCheck, getAllUsers);
router.get("/user/:id", authCheck, getUserById);
router.put("/user/:id", authCheck, updateUser);
router.delete("/user/:id", authCheck, deleteUser);

export default router;
