import { loginUser } from "../services/authService.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
