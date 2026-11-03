import { Router } from "express";
import {
  submitContactMessage,
  getAdminMessages,
  updateMessageStatus,
  removeContactMessage,
} from "../controllers/contactController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public route to submit contact form & trigger Nodemailer
router.post("/", submitContactMessage);

// Admin panel dashboard routes: fetch inbound messages with timestamp & location (Admin Only)
router.get("/", requireAdmin, getAdminMessages);
router.patch("/:id/status", requireAdmin, updateMessageStatus);
router.delete("/:id", requireAdmin, removeContactMessage);

export default router;

