import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory first, fallback to cwd
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

let connectionString = process.env.DATABASE_URL || "";
if (connectionString) {
  connectionString = connectionString.replace(/&?channel_binding=[^&]*/g, "").replace(/\?$/, "");
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
