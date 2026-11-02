import { pool } from "../config/db.js";

// Default habits template for new users
const DEFAULT_HABITS = [
  { title: "7+ Hours of Sleep", category: "sleep", icon: "Moon" },
  { title: "Drink 2L Water", category: "health", icon: "Droplets" },
  { title: "10-min Breath & Calm", category: "mindfulness", icon: "Wind" },
  { title: "Daily Physical Movement", category: "fitness", icon: "Activity" },
  { title: "Write Gratitude Note", category: "gratitude", icon: "Heart" },
];

export const seedDefaultHabitsForUser = async (userId) => {
  const check = await pool.query(`SELECT COUNT(*)::int AS count FROM habits WHERE user_id = $1;`, [userId]);
  if (check.rows[0].count === 0) {
    for (const h of DEFAULT_HABITS) {
      await pool.query(
        `INSERT INTO habits (user_id, title, category, icon) VALUES ($1, $2, $3, $4);`,
        [userId, h.title, h.category, h.icon]
      );
    }
  }
};

// Fetch habits with completion status for specific date & calculated streak
export const getHabitsWithStatus = async (userId, targetDate = null) => {
  await seedDefaultHabitsForUser(userId);

  const query = `
    SELECT 
      h.id,
      h.title,
      h.category,
      h.target_frequency,
      h.icon,
      h.is_active,
      h.created_at,
      CASE WHEN hl.id IS NOT NULL THEN TRUE ELSE FALSE END AS completed_today,
      (
        SELECT COUNT(DISTINCT l.completed_date)::int
        FROM habit_logs l
        WHERE l.habit_id = h.id 
          AND l.completed_date >= CURRENT_DATE - INTERVAL '30 days'
      ) AS completions_last_30_days
    FROM habits h
    LEFT JOIN habit_logs hl 
      ON h.id = hl.habit_id 
      AND hl.completed_date = COALESCE($2::date, CURRENT_DATE)
    WHERE h.user_id = $1 AND h.is_active = TRUE
    ORDER BY h.created_at ASC;
  `;
  const result = await pool.query(query, [userId, targetDate]);
  return result.rows;
};

export const createHabit = async ({ userId, title, category = "mindfulness", icon = "Check" }) => {
  const query = `
    INSERT INTO habits (user_id, title, category, icon)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, title, category, icon, is_active, created_at;
  `;
  const result = await pool.query(query, [userId, title, category, icon]);
  return result.rows[0];
};

export const toggleHabitCompletion = async ({ habitId, userId, date = null }) => {
  // First verify the habit exists and belongs to the user
  const habitRes = await pool.query(
    `SELECT id FROM habits WHERE id = $1 AND user_id = $2;`,
    [habitId, userId]
  );
  if (habitRes.rows.length === 0) {
    const error = new Error("Habit not found");
    error.statusCode = 404;
    throw error;
  }

  const checkQuery = `
    SELECT id FROM habit_logs
    WHERE habit_id = $1 AND user_id = $2 AND completed_date = COALESCE($3::date, CURRENT_DATE);
  `;
  const existing = await pool.query(checkQuery, [habitId, userId, date || null]);

  if (existing.rows.length > 0) {
    // Unmark completion
    await pool.query(`DELETE FROM habit_logs WHERE id = $1;`, [existing.rows[0].id]);
    return { completed: false };
  } else {
    // Mark completion
    await pool.query(
      `INSERT INTO habit_logs (habit_id, user_id, completed_date)
       VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE));`,
      [habitId, userId, date || null]
    );
    return { completed: true };
  }
};

export const deleteHabit = async (habitId, userId) => {
  const query = `
    DELETE FROM habits
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const result = await pool.query(query, [habitId, userId]);
  return result.rows[0] || null;
};

