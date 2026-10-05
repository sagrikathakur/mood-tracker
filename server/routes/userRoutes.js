import express from "express";
import {
  register,
  getByEmail,
  getById,
  getByIdForAuth,
  updateProfile,
} from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  updateProfileSchema,
} from "../validators/userValidator.js";

const router = express.Router();

// Register route (uses createUser)
router.post(
  "/register",
  validate(registerSchema),
  register
);

// Find user by email route (uses findUserByEmail)
router.get(
  "/email/:email",
  getByEmail
);

// Find user by ID route (uses findUserById)
router.get(
  "/id/:id",
  getById
);

// Find user by ID for Auth route (uses findUserByIdforAuth)
router.get(
  "/id/:id/auth",
  getByIdForAuth
);

// Update user profile route (uses updateUserProfile)
router.put(
  "/id/:id",
  validate(updateProfileSchema),
  updateProfile
);

export default router;