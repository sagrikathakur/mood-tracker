import crypto from "crypto";
import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  getCurrentUser,
  getGoogleAuthUrl,
  handleGoogleCallback,
} from "../services/authService.js";
import { env } from "../config/env.js";

// Helper to parse cookies from headers without requiring external dependency
const parseCookies = (req) => {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      list[parts.shift().trim()] = decodeURIComponent(parts.join("="));
    });
  }
  return list;
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const result = await registerUser({ name, email, password, phone, role });

    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const user = await getCurrentUser(userId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const cookies = parseCookies(req);
    const refreshToken = req.body?.refreshToken || cookies["refreshToken"];

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    const tokens = await refreshUserToken(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Tokens refreshed successfully",
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const cookies = parseCookies(req);
    const refreshToken = req.body?.refreshToken || cookies["refreshToken"];

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Redirect to Google OAuth consent page with CSRF protection state
export const googleAuth = async (req, res, next) => {
  try {
    const state = crypto.randomBytes(32).toString("hex");
    const { url } = getGoogleAuthUrl(state);

    // Set secure HTTP-only cookie for CSRF state verification
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    return res.redirect(url);
  } catch (error) {
    next(error);
  }
};

// Handle Google OAuth callback with CSRF check and secure session initialization
export const googleCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${env.clientUrl}/login?error=${encodeURIComponent(error)}`
      );
    }

    // CSRF Protection: Validate state parameter
    const cookies = parseCookies(req);
    const savedState = cookies["oauth_state"];

    if (savedState && state && savedState !== state) {
      res.clearCookie("oauth_state");
      console.warn("OAuth state mismatch: Possible CSRF attack intercepted.");
      return res.redirect(
        `${env.clientUrl}/login?error=${encodeURIComponent(
          "CSRF verification failed: suspicious request origin"
        )}`
      );
    }

    res.clearCookie("oauth_state");

    const result = await handleGoogleCallback(code);

    // Set secure HttpOnly cookie for refresh token
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

    // Redirect user back to frontend with tokens
    const redirectUrl = new URL(`${env.clientUrl}/login`);
    redirectUrl.searchParams.set("accessToken", result.accessToken);
    redirectUrl.searchParams.set("refreshToken", result.refreshToken);
    redirectUrl.searchParams.set("userId", result.user.id);
    redirectUrl.searchParams.set("name", result.user.name);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return res.redirect(
      `${env.clientUrl}/login?error=${encodeURIComponent(
        error.message || "OAuth authentication failed"
      )}`
    );
  }
};



