import express from "express";
import {
  fetchHabits,
  addHabit,
  toggleHabit,
  removeHabit,
} from "../controllers/habitController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", fetchHabits);
router.post("/", addHabit);
router.post("/:id/toggle", toggleHabit);
router.delete("/:id", removeHabit);

export default router;

