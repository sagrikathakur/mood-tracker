import express from "express";
import {
  fetchGoals,
  addGoal,
  updateGoal,
  removeGoal,
} from "../controllers/goalController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", fetchGoals);
router.post("/", addGoal);
router.patch("/:id", updateGoal);
router.delete("/:id", removeGoal);

export default router;

