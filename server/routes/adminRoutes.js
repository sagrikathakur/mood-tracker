import { Router } from "express";
import {
  getAdminOverview,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  deleteAdminUser,
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Protect all admin endpoints with requireAdmin middleware
router.use(requireAdmin);

// System telemetry & analytics overview
router.get("/overview", getAdminOverview);

// User moderation & directory
router.get("/users", getAdminUsers);
router.patch("/users/:id/role", updateAdminUserRole);
router.patch("/users/:id/status", updateAdminUserStatus);
router.delete("/users/:id", deleteAdminUser);

export default router;

