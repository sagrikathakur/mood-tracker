import express from "express";
import { getStickers, addSticker } from "../controllers/stickerController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/stickers - List available stickers
router.get("/", getStickers);

// POST /api/stickers - Add a new sticker (protected)
router.post("/", authenticateToken, addSticker);

export default router;
