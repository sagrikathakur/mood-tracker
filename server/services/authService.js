import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool } from "../config/db.js";
import {
  findUserByEmail,
  findUserByEmailForAuth,
  findUserByIdforAuth,
  createUser,
  findUserById,
  updatePassword,
  savePasswordResetToken,
  updateUserPasswordResetToken,
  saveUserByValidPasswordResetToken,
  findUserByValidPasswordResetToken,
  clearPasswordResetToken,
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

  const adminEmail = (process.env.ADMIN_EMAIL || "sagrikathakur68@gmail.com").trim().toLowerCase();
  const assignedRole = normalizedEmail === adminEmail ? "admin" : role;

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    phone,
    role: assignedRole,
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
  const normalizedEmail = (email || "").trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || "sagrikathakur68@gmail.com").trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || process.env.SMTP_PASS || "Sagrikathakur@1998").trim();

  let user = await findUserByEmailForAuth(normalizedEmail);
  const isAdminCredentials = normalizedEmail === adminEmail && password === adminPassword;

  // 1. If master admin account has not been created yet in the database, auto-provision it
  if (!user && isAdminCredentials) {
    const passwordHash = await bcrypt.hash(password, 12);
    user = await createUser({
      name: "Sagrika Admin",
      email: normalizedEmail,
      passwordHash,
      role: "admin",
    });
    user.password_hash = passwordHash;
    console.log(`[Auth] Auto-provisioned master admin account: ${normalizedEmail}`);
  }

  // 2. If master admin exists, ensure their role is 'admin' and password is in sync
  if (user && isAdminCredentials) {
    try {
      if (user.role !== "admin") {
        await pool.query("UPDATE users SET role = 'admin' WHERE id = $1;", [user.id]);
        user.role = "admin";
      }
      if (!user.password_hash) {
        const passwordHash = await bcrypt.hash(password, 12);
        await updatePassword(user.id, passwordHash);
        user.password_hash = passwordHash;
      }
    } catch (e) {
      console.warn("[Auth] Admin sync warning:", e.message);
    }
  }

  // 3. Verify password
  let isPasswordMatch = false;
  if (isAdminCredentials && user) {
    isPasswordMatch = true;
  } else {
    const hashToCompare = user?.password_hash || DUMMY_HASH;
    isPasswordMatch = await bcrypt.compare(password, hashToCompare);
  }

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
    const err = new Error("Invalid or expired refresh token");
    err.statusCode = 401;
    throw err;
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await findRefreshTokenByHash(tokenHash);

  if (!storedToken) {
    const err = new Error("Invalid or revoked refresh token");
    err.statusCode = 401;
    throw err;
  }

  if (new Date() > new Date(storedToken.expires_at)) {
    await revokeRefreshToken(tokenHash);
    const err = new Error("Refresh token expired");
    err.statusCode = 401;
    throw err;
  }

  // Revoke old refresh token (Refresh Token Rotation)
  await revokeRefreshToken(tokenHash);

  if (!decoded.userId || isNaN(Number(decoded.userId))) {
    const err = new Error("Invalid user in refresh token");
    err.statusCode = 401;
    throw err;
  }

  const user = await findUserByIdforAuth(Number(decoded.userId));
  if (!user || user.is_active === false) {
    const err = new Error("User inactive or not found");
    err.statusCode = 401;
    throw err;
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

// Request password reset token
export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  // Return generic response to prevent email enumeration
  if (!user) {
    return {
      success: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
    };
  }

  // Generate 64-char crypto hex token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

  await updateUserPasswordResetToken(user.email, rawToken, expiresAt);

  const resetUrl = `${env.clientUrl}/login?tab=reset&token=${rawToken}`;

  return {
    success: true,
    message: "If an account exists with this email, a password reset link has been dispatched.",
    // Exposed for developer convenience in non-production environments
    ...(process.env.NODE_ENV !== "production" && { devResetUrl: resetUrl }),
  };
};

// Reset password with verified token
export const resetPasswordWithToken = async (rawToken, newPassword) => {
  if (!rawToken || !newPassword) {
    const error = new Error("Token and new password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await findUserByValidPasswordResetToken(rawToken);
  if (!user) {
    const error = new Error("Invalid or expired password reset token");
    error.statusCode = 400;
    throw error;
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);
  const updatedUser = await saveUserByValidPasswordResetToken(rawToken, newPasswordHash);

  if (!updatedUser) {
    const error = new Error("Failed to reset password. Please try again.");
    error.statusCode = 500;
    throw error;
  }

  delete updatedUser.password_hash;
  return updatedUser;
};


