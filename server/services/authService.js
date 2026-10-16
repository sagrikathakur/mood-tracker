import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  findUserByEmail,
  findUserByEmailForAuth,
  findUserByIdforAuth,
  createUser,
  findUserById,
} from "../models/userModel.js";
import { findOrCreateOAuthUser } from "../models/oauthModel.js";
import { env } from "../config/env.js";


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

const REFRESH_TOKEN_EXPIRY_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export const registerUser = async ({
  name,
  email,
  password,
  phone = null,
  role = "user",
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    phone,
    role,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

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

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

// Dummy hash used for constant-time comparison to prevent email enumeration timing attacks
const DUMMY_HASH = "$2b$12$K1rT2yvO/4Y8mG1m3J4v.e9bVz7F1w5y9o0p1q2r3s4t5u6v7w8x9";

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmailForAuth(email);

  // Always perform bcrypt compare even if user is not found to prevent timing-based email enumeration
  const hashToCompare = user ? user.password_hash : DUMMY_HASH;
  const isPasswordMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !isPasswordMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
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
  if (!user || user.is_active === false) {
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

// Generate Google OAuth consent URL with CSRF protection state
export const getGoogleAuthUrl = (state) => {
  if (!env.googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured in environment variables");
  }

  const oauthState = state || crypto.randomBytes(32).toString("hex");
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: env.googleCallbackUrl,
    client_id: env.googleClientId,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    state: oauthState,
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  return {
    url: `${rootUrl}?${qs.toString()}`,
    state: oauthState,
  };
};

// Handle Google OAuth authorization code callback
export const handleGoogleCallback = async (code) => {
  if (!code) {
    throw new Error("Authorization code not provided");
  }

  if (!env.googleClientId || !env.googleClientSecret) {
    throw new Error(
      "Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are not configured"
    );
  }

  // 1. Exchange authorization code for tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: env.googleCallbackUrl,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    console.error("Google token exchange error:", tokenData);
    throw new Error(
      tokenData.error_description ||
        tokenData.error ||
        "Failed to exchange Google authorization code"
    );
  }

  // 2. Fetch user profile from Google UserInfo endpoint
  const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const googleUser = await userResponse.json();
  if (!userResponse.ok || !googleUser.email) {
    console.error("Google userinfo fetch error:", googleUser);
    throw new Error("Failed to retrieve user profile from Google");
  }

  // Strict Security: Ensure email is verified by Google
  if (googleUser.email_verified === false) {
    throw new Error(
      "Your Google account email is not verified. Please verify your email with Google first."
    );
  }

  // 3. Find or create user in database
  const user = await findOrCreateOAuthUser({
    googleId: googleUser.sub,
    email: googleUser.email.trim().toLowerCase(),
    name: (googleUser.name || googleUser.email.split("@")[0]).trim(),
  });

  if (user.is_active === false) {
    throw new Error("User account is inactive or disabled");
  }

  // 4. Generate JWT tokens for user session
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // 5. Store refresh token hash securely in database
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


