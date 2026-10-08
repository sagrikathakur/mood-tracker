import express from "express";
import { login, refresh, logout } from "../controllers/authController.js";
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

export default router;
