import { pool } from "../config/db.js";

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

// find user by email//
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT * FROM users WHERE email= $1;

    `
    [email]
  );
  return result.rows[0];
};