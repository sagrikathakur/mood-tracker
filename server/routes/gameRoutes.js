import express from "express";
import {
  submitScore,
  fetchLeaderboard,
  recordRecovery,
} from "../controllers/gameController.js";
import { authenticateToken, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/game/score (Optional auth: records score for registered or guest player)
router.post("/score", optionalAuth, submitScore);

// GET /api/game/leaderboard (Public: fetch top 10 runs for arcade or zen mode)
router.get("/leaderboard", fetchLeaderboard);

// POST /api/game/recovery (Requires login: logs 5-min sanctuary recovery streak)
router.post("/recovery", authenticateToken, recordRecovery);

export default router;

