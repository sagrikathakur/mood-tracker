import { pool } from "../config/db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";


// Create a user
export const createUser = async (data) => {
  const {
    name,
    email,
    passwordHash,
    phone = null,
    role = "user"
  } = data;

  const result = await pool.query(
    `
    INSERT INTO users (
      name,
      email,
      password_hash,
      phone,
      role
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      name,
      email,
      phone,
      role,
      is_active,
      created_at,
      updated_at
    `,
    [name, email, passwordHash, phone, role]
  );

  return result.rows[0];
};

// find user by email
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT * FROM users WHERE email = $1;
    `,
    [email]
  );
  return result.rows[0];
};

// find user by id
export const findUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      id,
      name,
      email,
      phone,
      is_active,
      created_at,
      updated_at
    FROM 
      users
    WHERE id = $1
    `,
    [id]
  );
  return result.rows[0];
};

// find user id for authOperation
export const findUserByIdforAuth = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      id,
      name,
      email,
      password_hash,
      phone,
      role,
      is_active
    FROM 
      users 
    WHERE id = $1
    `,
    [id]
  );
  return result.rows[0];
};

// update user profile
export const updateUserProfile = async (id, data) => {
  const { name, phone } = data;

  const result = await pool.query(
    `
    UPDATE users
    SET
      name = COALESCE($1, name),
      phone = COALESCE($2, phone),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, name, email, phone, is_active, created_at, updated_at
    `,
    [name, phone, id]
  );

  return result.rows[0];
};

// update user password
export const updatePassword = async (id, passwordHash) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      password_hash = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, name, email, phone, is_active, created_at, updated_at
    `,
    [passwordHash, id]
  );
  return result.rows[0];
};

// delete user account by id
export const deleteUserById = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING
      id,
      name,
      email,
      phone,
      role,
      is_active,
      created_at,
      updated_at;
    `,
    [id]
  );
  return result.rows[0];
};

export const deleteUserAccountById = deleteUserById;

// save password reset token
export const savePasswordResetToken = async (identifier, token, expiresAt) => {
  let target = identifier;
  let resetToken = token;
  let expiry = expiresAt;

  if (typeof identifier === "object" && identifier !== null) {
    target = identifier.id || identifier.userId || identifier.email;
    resetToken = identifier.token || identifier.resetToken;
    expiry = identifier.expiresAt || identifier.resetExpires || identifier.expires;
  }

  const isEmail = typeof target === "string" && target.includes("@");
  const whereClause = isEmail ? "email = $3" : "id = $3";

  try {
    const result = await pool.query(
      `
      UPDATE users
      SET
        password_reset_token = $1,
        password_reset_expires = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE ${whereClause}
      RETURNING
        id,
        name,
        email,
        phone,
        role,
        is_active,
        password_reset_token,
        password_reset_expires,
        created_at,
        updated_at;
      `,
      [resetToken, expiry, target]
    );
    return result.rows[0];
  } catch (error) {
    // Fallback if column names are reset_password_token / reset_password_expires
    if (error.code === "42703") {
      const fallbackResult = await pool.query(
        `
        UPDATE users
        SET
          reset_password_token = $1,
          reset_password_expires = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE ${whereClause}
        RETURNING
          id,
          name,
          email,
          phone,
          role,
          is_active,
          reset_password_token,
          reset_password_expires,
          created_at,
          updated_at;
        `,
        [resetToken, expiry, target]
      );
      return fallbackResult.rows[0];
    }
    throw error;
  }
};

// save user by valid password reset token
export const saveUserByValidPasswordResetToken = async (token, newPasswordHash = null) => {
  if (newPasswordHash) {
    try {
      const result = await pool.query(
        `
        UPDATE users
        SET
          password_hash = $1,
          password_reset_token = NULL,
          password_reset_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE password_reset_token = $2
          AND password_reset_expires > CURRENT_TIMESTAMP
        RETURNING
          id,
          name,
          email,
          phone,
          role,
          is_active,
          created_at,
          updated_at;
        `,
        [newPasswordHash, token]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === "42703") {
        const fallbackResult = await pool.query(
          `
          UPDATE users
          SET
            password_hash = $1,
            reset_password_token = NULL,
            reset_password_expires = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE reset_password_token = $2
            AND reset_password_expires > CURRENT_TIMESTAMP
          RETURNING
            id,
            name,
            email,
            phone,
            role,
            is_active,
            created_at,
            updated_at;
          `,
          [newPasswordHash, token]
        );
        return fallbackResult.rows[0];
      }
      throw error;
    }
  }

  // If no password hash is provided, find and return user by valid password reset token
  return await findUserByValidPasswordResetToken(token);
};

// find user by valid password reset token
export const findUserByValidPasswordResetToken = async (token) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        role,
        is_active,
        password_reset_token,
        password_reset_expires,
        created_at,
        updated_at
      FROM users
      WHERE password_reset_token = $1
        AND password_reset_expires > CURRENT_TIMESTAMP;
      `,
      [token]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === "42703") {
      const fallbackResult = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          phone,
          role,
          is_active,
          reset_password_token,
          reset_password_expires,
          created_at,
          updated_at
        FROM users
        WHERE reset_password_token = $1
          AND reset_password_expires > CURRENT_TIMESTAMP;
        `,
        [token]
      );
      return fallbackResult.rows[0];
    }
    throw error;
  }
};

export const findUserByResetToken = findUserByValidPasswordResetToken;

// clear password reset token
export const clearPasswordResetToken = async (identifierOrToken) => {
  let whereClause = "id = $1";
  if (typeof identifierOrToken === "string" && identifierOrToken.includes("@")) {
    whereClause = "email = $1";
  } else if (typeof identifierOrToken === "string" && identifierOrToken.length > 36) {
    whereClause = "password_reset_token = $1";
  }

  try {
    let result = await pool.query(
      `
      UPDATE users
      SET
        password_reset_token = NULL,
        password_reset_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE ${whereClause}
      RETURNING
        id,
        name,
        email,
        phone,
        role,
        is_active,
        created_at,
        updated_at;
      `,
      [identifierOrToken]
    );

    // If no row updated and whereClause was id, try matching token directly
    if (result.rows.length === 0 && whereClause === "id = $1") {
      result = await pool.query(
        `
        UPDATE users
        SET
          password_reset_token = NULL,
          password_reset_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE password_reset_token = $1
        RETURNING
          id,
          name,
          email,
          phone,
          role,
          is_active,
          created_at,
          updated_at;
        `,
        [identifierOrToken]
      );
    }

    return result.rows[0];
  } catch (error) {
    if (error.code === "42703") {
      let fallbackClause = whereClause.replace(
        "password_reset_token",
        "reset_password_token"
      );
      let fallbackResult = await pool.query(
        `
        UPDATE users
        SET
          reset_password_token = NULL,
          reset_password_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE ${fallbackClause}
        RETURNING
          id,
          name,
          email,
          phone,
          role,
          is_active,
          created_at,
          updated_at;
        `,
        [identifierOrToken]
      );

      if (fallbackResult.rows.length === 0 && fallbackClause === "id = $1") {
        fallbackResult = await pool.query(
          `
          UPDATE users
          SET
            reset_password_token = NULL,
            reset_password_expires = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE reset_password_token = $1
          RETURNING
            id,
            name,
            email,
            phone,
            role,
            is_active,
            created_at,
            updated_at;
          `,
          [identifierOrToken]
        );
      }

      return fallbackResult.rows[0];
    }
    throw error;
  }
};

// find user by Google ID
export const findUserByGoogleId = async (googleId) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        id,
        name,
        email,
        phone,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
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

// find or create user for OAuth (Google)
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
      RETURNING
        id,
        name,
        email,
        phone,
        role,
        is_active,
        created_at,
        updated_at;
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
        RETURNING
          id,
          name,
          email,
          phone,
          role,
          is_active,
          created_at,
          updated_at;
        `,
        [name, email, passwordHash, "user"]
      );
      return fallbackResult.rows[0];
    }
    throw error;
  }
};

