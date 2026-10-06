import express from "express";
import { login } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validators/userValidator.js";

const router = express.Router();

// POST /api/auth/login
router.post(
  "/login",
  validate(loginSchema),
  login
);

export default router;
