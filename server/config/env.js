import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  databaseUrlPooled: process.env.DATABASE_URL_POOLED,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,

  accessTokenExpiresIn:
    process.env.ACCESS_TOKEN_EXPIRES_IN,

  refreshTokenExpiresIn:
    process.env.REFRESH_TOKEN_EXPIRES_IN,

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

