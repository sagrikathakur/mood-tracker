import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log("Running one-time schema migration...");
  try {
    const schemaSql = fs.readFileSync(
      path.resolve(__dirname, "../db/schema.sql"),
      "utf-8"
    );
    await pool.query(schemaSql);
    console.log("Schema migration completed successfully! All tables created.");
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    await pool.end();
  }
}

runMigration();

