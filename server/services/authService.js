import bcrypt from "bcrypt";
import { findUserByEmail, findUserByIdforAuth } from "../models/userModel.js";
import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
} from "../models/refreshTokenModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/token.js";

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

  // Hash & persist refresh token in database
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await createRefreshToken(user.id, tokenHash, expiresAt);

  delete user.password_hash;

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const refreshUserToken = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await findRefreshTokenByHash(tokenHash);

  if (!storedToken) {
    throw new Error("Invalid or revoked refresh token");
  }

  if (new Date() > new Date(storedToken.expires_at)) {
    await revokeRefreshToken(tokenHash);
    throw new Error("Refresh token expired");
  }

  // Revoke old refresh token (Refresh Token Rotation)
  await revokeRefreshToken(tokenHash);

  const user = await findUserByIdforAuth(decoded.userId);
  if (!user || !user.is_active) {
    throw new Error("User inactive or not found");
  }

  // Generate new token pair
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  // Persist new refresh token hash in DB
  const newTokenHash = hashToken(newRefreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await createRefreshToken(user.id, newTokenHash, expiresAt);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await revokeRefreshToken(tokenHash);
};
