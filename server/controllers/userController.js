import {
  registerUser,
  getUserByEmail,
  getUserById,
  getUserByIdForAuth,
  modifyUserProfile,
  modifyUserPassword,
} from "../services/userService.js";

// Controller for registerUser (uses createUser)
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

// Controller for getUserByEmail (uses findUserByEmail)
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

// Controller for getUserById (uses findUserById)
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for getUserByIdForAuth (uses findUserByIdforAuth)
export const getByIdForAuth = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await getUserByIdForAuth(id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Controller for modifyUserProfile (uses updateUserProfile)
export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

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

// Controller for modifyUserPassword (uses updatePassword)
export const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const user = await modifyUserPassword(id, password);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
