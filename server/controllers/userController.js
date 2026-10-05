import { registerUser, getUserByEmail } from "../services/userService.js";

// Controller for registerUser
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const user = await registerUser({
      name,
      email,
      password,
      phone,
      role,
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

// Controller for getUserByEmail (findUserByEmail)
export const getByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = await getUserByEmail(email);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
