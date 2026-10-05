import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdforAuth,
  updateUserProfile,
  updatePassword,
} from "../models/userModel.js";

// Service to register a user using createUser model function
export const registerUser = async ({
  name,
  email,
  password,
  phone,
  role,
}) => {
  // Step 2: Check if email already exists before calling createUser
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser({
    name,
    email,
    passwordHash,
    phone,
    role,
  });

  return user;
};

// Service to get/find a user by email using findUserByEmail model function
export const getUserByEmail = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

// Service to get/find a user by ID using findUserById model function
export const getUserById = async (id) => {
  const user = await findUserById(id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

// Service to get user by ID for auth operations using findUserByIdforAuth model function
export const getUserByIdForAuth = async (id) => {
  const user = await findUserByIdforAuth(id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

// Service to update user profile using updateUserProfile model function
export const modifyUserProfile = async (id, data) => {
  const updatedUser = await updateUserProfile(id, data);
  if (!updatedUser) {
    const error = new Error("User not found or update failed");
    error.statusCode = 404;
    throw error;
  }
  return updatedUser;
};

// Service to update user password using updatePassword model function
export const modifyUserPassword = async (id, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updatedUser = await updatePassword(id, passwordHash);
  if (!updatedUser) {
    const error = new Error("User not found or password update failed");
    error.statusCode = 404;
    throw error;
  }
  return updatedUser;
};