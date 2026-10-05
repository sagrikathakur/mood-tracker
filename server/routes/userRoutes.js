import express from "express";
import { register, getByEmail } from "../controllers/userController.js";
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
  "/:email",
  getByEmail
);

export default router;