import express from "express";
import {
  register,
  getByEmail,
  getById,
  getByIdForAuth,
} from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { registerSchema } from "../validators/userValidator.js";

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

export default router;