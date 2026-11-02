import express from "express";
import { getReflectionInsights } from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/insights", getReflectionInsights);

export default router;

