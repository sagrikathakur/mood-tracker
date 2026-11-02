import { pool } from "../config/db.js";

export const getGoalsByUserId = async (userId) => {
  const query = `
    SELECT 
      id,
      user_id,
      title,
      target_description,
      TO_CHAR(target_date, 'YYYY-MM-DD') AS target_date,
      progress,
      completed,
      created_at
    FROM wellness_goals
    WHERE user_id = $1
    ORDER BY completed ASC, target_date ASC NULLS LAST, created_at DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

export const createGoalRecord = async ({ userId, title, targetDescription = "", targetDate = null }) => {
  const query = `
    INSERT INTO wellness_goals (user_id, title, target_description, target_date)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, title, target_description, TO_CHAR(target_date, 'YYYY-MM-DD') AS target_date, progress, completed, created_at;
  `;
  const result = await pool.query(query, [userId, title, targetDescription, targetDate]);
  return result.rows[0];
};

export const updateGoalRecord = async (goalId, userId, { progress, completed }) => {
  const updates = [];
  const params = [goalId, userId];

  if (progress !== undefined) {
    params.push(Math.min(100, Math.max(0, parseInt(progress, 10))));
    updates.push(`progress = $${params.length}`);
  }

  if (completed !== undefined) {
    params.push(Boolean(completed));
    updates.push(`completed = $${params.length}`);
  }

  if (updates.length === 0) return null;

  const query = `
    UPDATE wellness_goals
    SET ${updates.join(", ")}
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, title, target_description, TO_CHAR(target_date, 'YYYY-MM-DD') AS target_date, progress, completed, created_at;
  `;
  const result = await pool.query(query, params);
  return result.rows[0] || null;
};

export const deleteGoalRecord = async (goalId, userId) => {
  const query = `
    DELETE FROM wellness_goals
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const result = await pool.query(query, [goalId, userId]);
  return result.rows[0] || null;
};

