import express from "express";
import { register } from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { registerSchema } from "../validators/userValidator.js";

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

export default router;