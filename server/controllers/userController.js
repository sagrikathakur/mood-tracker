import {
  registerUser,
  getUserByEmail,
  getUserById,
  modifyUserProfile,
  modifyUserPassword,
} from "../services/userService.js";
import { registerUser as registerUserWithTokens } from "../services/authService.js";

// Controller for registerUser
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const result = await registerUserWithTokens({
      name,
      email,
      password,
      phone,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for getting authenticated user profile
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const user = await getUserById(userId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for getUserByEmail (Admin or self)
export const getByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    // Check authorization: must be admin or the requested email
    if (req.user?.role !== "admin" && req.user?.email !== email) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const user = await getUserByEmail(email);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for getUserById
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Must be self or admin
    const currentUserId = req.user.id || req.user.userId;
    if (String(currentUserId) !== String(id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You can only view your own profile" });
    }

    const user = await getUserById(id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for modifyUserProfile
export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    // Must be self or admin
    const currentUserId = req.user.id || req.user.userId;
    if (String(currentUserId) !== String(id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: You can only update your own profile" });
    }

    const user = await modifyUserProfile(id, { name, phone });

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for modifyUserPassword
export const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, currentPassword } = req.body;

    // Must be self
    const currentUserId = req.user.id || req.user.userId;
    if (String(currentUserId) !== String(id)) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only update your own password" });
    }

    const user = await modifyUserPassword(id, password, currentPassword);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
