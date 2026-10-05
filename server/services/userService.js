import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../models/userModel.js";

// Service to register a user using createUser model function
export const registerUser = async ({
  name,
  email,
  password,
  phone,
  role,
}) => {
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