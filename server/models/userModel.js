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
// find user by id//
export const findUserById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      id ,
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
  )
  return result.rows[0]
}

// find user id for authOperation//

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
      is_active,
    
      FROM 
      users 
      WHERE id = $1
    `,
    [id]
  )
  return result.rows[0];
}

// update user profile//

export const updateUserProfile = async (id, data) => {
  const { name, phone } = data;

  const result = await pool.query(
    `
    UPDATE users
    SET
     name = COALESCE ($1,name),
     phone = COALESCE($3, phone),
     updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, name, email, phone, is_active, created_at, updated_at
    `,
    [name, phone, id]
  );

  return result.rows[0];
};
