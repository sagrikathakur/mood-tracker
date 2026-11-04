import express from "express";
import {
  getMe,
  getByEmail,
  getById,
  updateProfile,
  changePassword,
} from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  updateProfileSchema,
  updatePasswordSchema,
} from "../validators/userValidator.js";

const router = express.Router();

// Get current authenticated user profile (Alias for /api/auth/me)
router.get(
  "/me",
  authenticateToken,
  getMe
);

// Find user by email route (admin or matching user only)
router.get(
  "/email/:email",
  authenticateToken,
  getByEmail
);

// Find user by ID route (self or admin only)
router.get(
  "/id/:id",
  authenticateToken,
  getById
);

// Update user profile route (self or admin only)
router.put(
  "/id/:id",
  authenticateToken,
  validate(updateProfileSchema),
  updateProfile
);

// Update user password route (self only)
router.patch(
  "/id/:id/password",
  authenticateToken,
  validate(updatePasswordSchema),
  changePassword
);

export default router;