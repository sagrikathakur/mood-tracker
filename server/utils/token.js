import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    env.accessTokenSecret,
    {
      expiresIn: env.accessTokenExpiresIn,
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
    },
    env.refreshTokenSecret,
    {
      expiresIn: env.refreshTokenExpiresIn,
    }
  );
};