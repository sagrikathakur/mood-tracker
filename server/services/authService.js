import bcrypt from "bcrypt";
import { findUserByEmail } from "../models/userModel.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  delete user.password_hash;

  return {
    user,
    accessToken,
    refreshToken,
  };
};
