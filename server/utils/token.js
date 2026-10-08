import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      jti: crypto.randomUUID(),
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
      jti: crypto.randomUUID(),
    },
    env.refreshTokenSecret,
    {
      expiresIn: env.refreshTokenExpiresIn,
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.accessTokenSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.refreshTokenSecret);
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};