import { pool } from "../config/db.js";

// creat a user//

export const createUser = async (data) => {
  const { name, email, passwordHash, phone = null, role = "user" } = data;
  const result = await pool.query(
    `
    `
  )
}