import express from "express";
import {
  addMoodLog,
  fetchMoodLogs,
  fetchMoodCalendar,
  fetchMoodCorrelation,
  removeMoodLog,
} from "../controllers/moodController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", addMoodLog);
router.get("/", fetchMoodLogs);
router.get("/calendar", fetchMoodCalendar);
router.get("/correlation", fetchMoodCorrelation);
router.delete("/:id", removeMoodLog);

export default router;

