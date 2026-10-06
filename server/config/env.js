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
};
