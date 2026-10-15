import { pool } from "../config/db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { findUserByEmail } from "./userModel.js";

// Find user by Google ID
export const findUserByGoogleId = async (googleId) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE google_id = $1;
      `,
      [googleId]
    );
    return result.rows[0];
  } catch (error) {
    // If google_id column doesn't exist yet, return null gracefully
    if (error.code === "42703") {
      return null;
    }
    throw error;
  }
};

// Find or create user for OAuth (Google)
export const findOrCreateOAuthUser = async ({ googleId, email, name }) => {
  // 1. Try finding by Google ID first
  if (googleId) {
    const existingGoogleUser = await findUserByGoogleId(googleId);
    if (existingGoogleUser) {
      return existingGoogleUser;
    }
  }

  // 2. Try finding by email
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    // Link google_id if column exists
    if (googleId) {
      try {
        await pool.query(
          `
          UPDATE users
          SET google_id = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2;
          `,
          [googleId, existingUser.id]
        );
      } catch (err) {
        if (err.code !== "42703") throw err;
      }
    }
    return existingUser;
  }

  // 3. Create new user for OAuth account
  const randomPassword = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  try {
    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        google_id,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [name, email, passwordHash, googleId, "user"]
    );
    return result.rows[0];
  } catch (error) {
    // If google_id column doesn't exist in the users table, insert without it
    if (error.code === "42703") {
      const fallbackResult = await pool.query(
        `
        INSERT INTO users (
          name,
          email,
          password_hash,
          role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
        [name, email, passwordHash, "user"]
      );
      return fallbackResult.rows[0];
    }
    throw error;
  }
};
