import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  databaseUrlPooled: process.env.DATABASE_URL_POOLED,
};
