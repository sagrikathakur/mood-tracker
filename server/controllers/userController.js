
import { registerUser } from "../services/userService.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const user = await registerUser({
      name,
      email,
      password,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
