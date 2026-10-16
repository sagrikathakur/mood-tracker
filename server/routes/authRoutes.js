import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  googleAuth,
  googleCallback,
} from "../controllers/authController.js";

import { validate } from "../middleware/validate.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { registerLimiter, loginLimiter } from "../middleware/rateLimiter.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/userValidator.js";

const router = express.Router();

// POST /api/auth/register (Rate-limited to protect against bot creation & credential stuffing)
router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  register
);

// GET /api/auth/me
router.get(
  "/me",
  authenticateToken,
  getMe
);

// POST /api/auth/login (Rate-limited to protect against brute force attacks)
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  login
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  refresh
);

// POST /api/auth/logout
router.post(
  "/logout",
  validate(refreshTokenSchema),
  logout
);

// GET /api/auth/google
router.get("/google", googleAuth);

// GET /api/auth/google/callback
router.get("/google/callback", googleCallback);

export default router;

