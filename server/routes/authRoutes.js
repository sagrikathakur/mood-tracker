import express from "express";
import {
  login,
  refresh,
  logout,
  googleAuth,
  googleCallback,
} from "../controllers/authController.js";

import { validate } from "../middleware/validate.js";
import {
  loginSchema,
  refreshTokenSchema,
} from "../validators/userValidator.js";

const router = express.Router();

// POST /api/auth/login
router.post(
  "/login",
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

