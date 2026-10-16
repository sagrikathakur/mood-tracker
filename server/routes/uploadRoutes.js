import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/upload - Upload an image (authenticated)
router.post("/", authenticateToken, uploadImage);

export default router;
