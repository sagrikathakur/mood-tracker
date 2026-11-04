import { pool } from "../config/db.js";

/**
 * Model for Anxiety Calm Game Telemetry & Leaderboard
 */

// Save game run score
export const saveGameScore = async ({
  userId = null,
  playerName = "Zen Runner",
  mode = "arcade",
  score = 0,
  distance = 0,
  maxCombo = 0,
  starsCollected = 0,
}) => {
  const query = `
    INSERT INTO game_scores (
      user_id,
      player_name,
      mode,
      score,
      distance,
      max_combo,
      stars_collected
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      user_id,
      player_name,
      mode,
      score,
      distance,
      max_combo,
      stars_collected,
      created_at;
  `;

  const values = [
    userId,
    playerName.trim() || "Zen Runner",
    mode.toLowerCase(),
    parseInt(score, 10) || 0,
    parseInt(distance, 10) || 0,
    parseInt(maxCombo, 10) || 0,
    parseInt(starsCollected, 10) || 0,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get top Hall of Fame leaderboard runs
export const getLeaderboard = async ({ mode = "arcade", limit = 10 }) => {
  const query = `
    SELECT
      g.id,
      g.user_id,
      g.player_name,
      g.mode,
      g.score,
      g.distance,
      g.max_combo,
      g.stars_collected,
      g.created_at,
      u.name AS registered_name
    FROM game_scores g
    LEFT JOIN users u ON g.user_id = u.id
    WHERE g.mode = $1
    ORDER BY g.score DESC, g.distance DESC
    LIMIT $2;
  `;

  const result = await pool.query(query, [mode.toLowerCase(), Math.min(limit, 50)]);
  return result.rows;
};

// Get user's personal best run
export const getUserBestScore = async (userId, mode = "arcade") => {
  if (!userId) return null;

  const query = `
    SELECT
      id,
      score,
      distance,
      max_combo,
      stars_collected,
      created_at
    FROM game_scores
    WHERE user_id = $1 AND mode = $2
    ORDER BY score DESC
    LIMIT 1;
  `;

  const result = await pool.query(query, [userId, mode.toLowerCase()]);
  return result.rows[0] || null;
};

// Log 5-minute recovery run directly into daily wellness telemetry
export const logRecoverySession = async (userId, minutes = 5) => {
  if (!userId) return null;

  const query = `
    INSERT INTO wellness_metrics (
      user_id,
      log_date,
      notes
    )
    VALUES (
      $1,
      CURRENT_DATE,
      'Completed ' || $2 || '-min Zen Flow recovery run in Calm Me sanctuary.'
    )
    ON CONFLICT (user_id, log_date)
    DO UPDATE SET
      notes = COALESCE(wellness_metrics.notes || E'\n', '') || 'Completed ' || $2 || '-min Zen Flow recovery run.'
    RETURNING *;
  `;

  const result = await pool.query(query, [userId, minutes]);
  return result.rows[0];
};

