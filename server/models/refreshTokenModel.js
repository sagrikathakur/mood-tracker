import { pool } from "../config/db.js";

// Save a new refresh token hash
export const createRefreshToken = async (userId, tokenHash, expiresAt) => {
  const result = await pool.query(
    `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
};

// Find an active (non-revoked) refresh token by its hash
export const findRefreshTokenByHash = async (tokenHash) => {
  const result = await pool.query(
    `
    SELECT * FROM refresh_tokens
    WHERE token_hash = $1 AND revoked_at IS NULL;
    `,
    [tokenHash]
  );
  return result.rows[0];
};

// Revoke a specific refresh token (Logout)
export const revokeRefreshToken = async (tokenHash) => {
  const result = await pool.query(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = $1
    RETURNING *;
    `,
    [tokenHash]
  );
  return result.rows[0];
};

// Revoke all active refresh tokens for a user
export const revokeAllUserRefreshTokens = async (userId) => {
  await pool.query(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = $1 AND revoked_at IS NULL;
    `,
    [userId]
  );
};
