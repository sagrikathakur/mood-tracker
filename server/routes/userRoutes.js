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

router.get(
  "/me",
  authenticateToken,
  getMe
);

router.get(
  "/email/:email",
  authenticateToken,
  getByEmail
);

// Find user by ID route 
router.get(
  "/id/:id",
  authenticateToken,
  getById
);

// Update user profile route
router.put(
  "/id/:id",
  authenticateToken,
  validate(updateProfileSchema),
  updateProfile
);

// Update user password route 
router.patch(
  "/id/:id/password",
  authenticateToken,
  validate(updatePasswordSchema),
  changePassword
);

export default router;