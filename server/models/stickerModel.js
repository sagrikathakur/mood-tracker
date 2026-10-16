import { pool } from "../config/db.js";

export const findAllStickers = async () => {
  const result = await pool.query(
    `SELECT id, name, emoji, image_url, category FROM stickers ORDER BY id ASC;`
  );
  return result.rows;
};

export const createSticker = async ({ name, emoji, imageUrl, category = "general" }) => {
  const result = await pool.query(
    `
    INSERT INTO stickers (name, emoji, image_url, category)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, emoji, image_url, category;
    `,
    [name, emoji, imageUrl, category]
  );
  return result.rows[0];
};
