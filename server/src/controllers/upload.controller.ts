import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const uploadSingle = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        const file = req.file;
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const uploadsDir = path.join(__dirname, "../../uploads");
        const uploadPath = path.join(uploadsDir, fileName);

        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Move file to uploads directory
        fs.writeFileSync(uploadPath, file.buffer);

        const fileUrl = `${req.protocol}://${req.get(
            "host"
        )}/api/upload/image/${fileName}`;

        res.json({
            message: "File uploaded successfully",
            filename: fileName,
            url: fileUrl,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
        });
    } catch (error: any) {
        console.error("Upload single error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const uploadMultiple = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ error: "No files uploaded" });
            return;
        }

        const files = req.files as Express.Multer.File[];
        const uploadedFiles = [];
        const uploadsDir = path.join(__dirname, "../../uploads");

        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        for (const file of files) {
            const fileExtension = path.extname(file.originalname);
            const fileName = `${uuidv4()}${fileExtension}`;
            const uploadPath = path.join(uploadsDir, fileName);

            // Write file to uploads directory
            fs.writeFileSync(uploadPath, file.buffer);

            const fileUrl = `${req.protocol}://${req.get(
                "host"
            )}/api/upload/image/${fileName}`;

            uploadedFiles.push({
                filename: fileName,
                url: fileUrl,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
            });
        }

        res.json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        });
    } catch (error: any) {
        console.error("Upload multiple error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteImage = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { filename } = req.params;

        if (!filename) {
            res.status(400).json({ error: "Filename is required" });
            return;
        }

        const filePath = path.join(__dirname, "../../uploads", filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: "File not found" });
            return;
        }

        // Delete the file
        fs.unlinkSync(filePath);

        res.json({ message: "File deleted successfully" });
    } catch (error: any) {
        console.error("Delete image error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getImageUrl = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { filename } = req.params;

        if (!filename) {
            res.status(400).json({ error: "Filename is required" });
            return;
        }

        const filePath = path.join(__dirname, "../../uploads", filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: "File not found" });
            return;
        }

        // Send the file
        res.sendFile(filePath);
    } catch (error: any) {
        console.error("Get image error:", error);
        res.status(500).json({ error: error.message });
    }
};
