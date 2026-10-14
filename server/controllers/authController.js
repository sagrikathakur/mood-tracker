import {
  loginUser,
  refreshUserToken,
  logoutUser,
  getGoogleAuthUrl,
  handleGoogleCallback,
} from "../services/authService.js";
import { env } from "../config/env.js";


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

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
    const { refreshToken } = req.body;
    const tokens = await refreshUserToken(refreshToken);

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
    const { refreshToken } = req.body;
    await logoutUser(refreshToken);

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Redirect to Google OAuth consent page
export const googleAuth = async (req, res, next) => {
  try {
    const url = getGoogleAuthUrl();
    return res.redirect(url);
  } catch (error) {
    next(error);
  }
};

// Handle Google OAuth callback
export const googleCallback = async (req, res, next) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(
        `${env.clientUrl}/login?error=${encodeURIComponent(error)}`
      );
    }

    const result = await handleGoogleCallback(code);

    // Redirect user back to frontend with tokens
    const redirectUrl = new URL(`${env.clientUrl}/login`);
    redirectUrl.searchParams.set("accessToken", result.accessToken);
    redirectUrl.searchParams.set("refreshToken", result.refreshToken);
    redirectUrl.searchParams.set("userId", result.user.id);
    redirectUrl.searchParams.set("name", result.user.name);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    return res.redirect(
      `${env.clientUrl}/login?error=${encodeURIComponent(
        error.message || "OAuth authentication failed"
      )}`
    );
  }
};

