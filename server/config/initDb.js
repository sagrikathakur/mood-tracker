import { pool } from "./db.js";

export const initDb = async () => {
  try {
    const res = await pool.query("SELECT 1 AS connected;");
    if (res.rows[0]?.connected === 1) {
      console.log("PostgreSQL Database connected successfully 🟢");
    }
  } catch (error) {
    console.error("Database connection notice:", error.message);
  }
};
