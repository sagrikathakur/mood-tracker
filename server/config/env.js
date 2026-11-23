import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const cleanEnv = (val) => {
  if (!val) return val;
  const trimmed = String(val).trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

export const env = {
  port: cleanEnv(process.env.PORT) || 3000,
  databaseUrl: cleanEnv(process.env.DATABASE_URL),
  databaseUrlPooled: cleanEnv(process.env.DATABASE_URL_POOLED),
  accessTokenSecret: cleanEnv(process.env.ACCESS_TOKEN_SECRET),
  refreshTokenSecret: cleanEnv(process.env.REFRESH_TOKEN_SECRET),

  accessTokenExpiresIn: cleanEnv(process.env.ACCESS_TOKEN_EXPIRES_IN) || "30d",
  refreshTokenExpiresIn: cleanEnv(process.env.REFRESH_TOKEN_EXPIRES_IN) || "90d",

  // Google OAuth
  googleClientId: cleanEnv(process.env.GOOGLE_CLIENT_ID),
  googleClientSecret: cleanEnv(process.env.GOOGLE_CLIENT_SECRET),
  googleCallbackUrl:
    cleanEnv(process.env.GOOGLE_CALLBACK_URL) ||
    "http://localhost:3000/api/auth/google/callback",
  clientUrl: cleanEnv(process.env.CLIENT_URL) || "http://localhost:5173",
};
