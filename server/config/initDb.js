import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initDb = async () => {
  try {
    const res = await pool.query("SELECT 1 AS connected;");
    if (res.rows[0]?.connected === 1) {
      console.log("PostgreSQL Database connected successfully 🟢");
    }

    const schemaPath = path.resolve(__dirname, "../db/schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, "utf-8");
      await pool.query(schemaSql);
      console.log("Database schema & tables initialized successfully 🚀");
    }
  } catch (error) {
    console.error("Database initialization notice:", error.message);
  }
};
