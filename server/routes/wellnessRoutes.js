import express from "express";
import {
  saveDailyMetrics,
  fetchWellnessHistory,
  fetchTodayMetrics,
} from "../controllers/wellnessController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/daily", saveDailyMetrics);
router.get("/history", fetchWellnessHistory);
router.get("/today", fetchTodayMetrics);

export default router;

