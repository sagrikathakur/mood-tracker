import {
  loginUser,
  refreshUserToken,
  logoutUser,
} from "../services/authService.js";

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
