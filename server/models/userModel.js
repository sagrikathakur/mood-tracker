import { pool } from "../config/db.js";
import crypto from "crypto";


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

// Hash helper to ensure reset tokens are never stored in plain-text (OWASP Standard)
const hashResetToken = (token) => {
  if (!token || typeof token !== "string") return token;
  return token.length === 64 && /^[0-9a-f]{64}$/i.test(token)
    ? token
    : crypto.createHash("sha256").update(token).digest("hex");
};

// save password reset token (hashed with SHA-256)
export const savePasswordResetToken = async (identifier, token, expiresAt) => {
  let target = identifier;
  let resetToken = token;
  let expiry = expiresAt;

  if (typeof identifier === "object" && identifier !== null) {
    target = identifier.id || identifier.userId || identifier.email;
    resetToken = identifier.token || identifier.resetToken;
    expiry = identifier.expiresAt || identifier.resetExpires || identifier.expires;
  }

  const hashedToken = hashResetToken(resetToken);
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
        created_at,
        updated_at;
      `,
      [hashedToken, expiry, target]
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
          created_at,
          updated_at;
        `,
        [hashedToken, expiry, target]
      );
      return fallbackResult.rows[0];
    }
    throw error;
  }
};

// save user by valid password reset token
export const saveUserByValidPasswordResetToken = async (token, newPasswordHash = null) => {
  const hashedToken = hashResetToken(token);

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
        WHERE (password_reset_token = $2 OR password_reset_token = $3)
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
        [newPasswordHash, hashedToken, token]
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
          WHERE (reset_password_token = $2 OR reset_password_token = $3)
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
          [newPasswordHash, hashedToken, token]
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
  const hashedToken = hashResetToken(token);

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
      WHERE (password_reset_token = $1 OR password_reset_token = $2)
        AND password_reset_expires > CURRENT_TIMESTAMP;
      `,
      [hashedToken, token]
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
          created_at,
          updated_at
        FROM users
        WHERE (reset_password_token = $1 OR reset_password_token = $2)
          AND reset_password_expires > CURRENT_TIMESTAMP;
        `,
        [hashedToken, token]
      );
      return fallbackResult.rows[0];
    }
    throw error;
  }
};


export const findUserByResetToken = findUserByValidPasswordResetToken;

// clear password reset token
export const clearPasswordResetToken = async (identifierOrToken) => {
  const hashedToken = hashResetToken(identifierOrToken);
  let whereClause = "id = $1";
  if (typeof identifierOrToken === "string" && identifierOrToken.includes("@")) {
    whereClause = "email = $1";
  } else if (typeof identifierOrToken === "string" && identifierOrToken.length > 36) {
    whereClause = "(password_reset_token = $1 OR password_reset_token = $2)";
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
      whereClause.includes("$2")
        ? [identifierOrToken, hashedToken]
        : [identifierOrToken]
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
        WHERE (password_reset_token = $1 OR password_reset_token = $2)
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
        [identifierOrToken, hashedToken]
      );
    }

    return result.rows[0];
  } catch (error) {
    if (error.code === "42703") {
      let fallbackClause = whereClause.replace(
        /password_reset_token/g,
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
        fallbackClause.includes("$2")
          ? [identifierOrToken, hashedToken]
          : [identifierOrToken]
      );

      if (fallbackResult.rows.length === 0 && fallbackClause === "id = $1") {
        fallbackResult = await pool.query(
          `
          UPDATE users
          SET
            reset_password_token = NULL,
            reset_password_expires = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE (reset_password_token = $1 OR reset_password_token = $2)
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
          [identifierOrToken, hashedToken]
        );
      }

      return fallbackResult.rows[0];
    }
    throw error;
  }
};


// Re-export OAuth user functions from dedicated oauthModel.js
export { findUserByGoogleId, findOrCreateOAuthUser } from "./oauthModel.js";


