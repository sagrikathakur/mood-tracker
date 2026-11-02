import { pool } from "../config/db.js";

// Upsert daily wellness metric (one record per user per day)
export const upsertWellnessMetric = async ({
  userId,
  logDate = null,
  sleepHours = 7.0,
  sleepQuality = 3,
  stressLevel = 3,
  waterGlasses = 0,
  screenTimeHours = 0.0,
  notes = "",
}) => {
  const query = `
    INSERT INTO wellness_metrics (
      user_id, log_date, sleep_hours, sleep_quality, stress_level, water_glasses, screen_time_hours, notes
    )
    VALUES ($1, COALESCE($2::date, CURRENT_DATE), $3, $4, $5, $6, $7, $8)
    ON CONFLICT (user_id, log_date)
    DO UPDATE SET
      sleep_hours = EXCLUDED.sleep_hours,
      sleep_quality = EXCLUDED.sleep_quality,
      stress_level = EXCLUDED.stress_level,
      water_glasses = EXCLUDED.water_glasses,
      screen_time_hours = EXCLUDED.screen_time_hours,
      notes = EXCLUDED.notes
    RETURNING id, user_id, TO_CHAR(log_date, 'YYYY-MM-DD') AS log_date, sleep_hours, sleep_quality, stress_level, water_glasses, screen_time_hours, notes;
  `;
  const result = await pool.query(query, [
    userId,
    logDate,
    sleepHours,
    sleepQuality,
    stressLevel,
    waterGlasses,
    screenTimeHours,
    notes,
  ]);
  return result.rows[0];
};

// Get wellness metrics history
export const getWellnessMetrics = async (userId, days = 14) => {
  const query = `
    SELECT 
      id,
      user_id,
      TO_CHAR(log_date, 'YYYY-MM-DD') AS log_date,
      TO_CHAR(log_date, 'Dy') AS day_name,
      sleep_hours::float AS sleep_hours,
      sleep_quality,
      stress_level,
      water_glasses,
      screen_time_hours::float AS screen_time_hours,
      notes
    FROM wellness_metrics
    WHERE user_id = $1 AND log_date >= CURRENT_DATE - ($2 || ' days')::interval
    ORDER BY log_date ASC;
  `;
  const result = await pool.query(query, [userId, days]);
  return result.rows;
};

// Get today's metric
export const getTodayMetric = async (userId, targetDate = null) => {
  const query = `
    SELECT 
      id,
      user_id,
      TO_CHAR(log_date, 'YYYY-MM-DD') AS log_date,
      sleep_hours::float AS sleep_hours,
      sleep_quality,
      stress_level,
      water_glasses,
      screen_time_hours::float AS screen_time_hours,
      notes
    FROM wellness_metrics
    WHERE user_id = $1 AND log_date = COALESCE($2::date, CURRENT_DATE)
    LIMIT 1;
  `;
  const result = await pool.query(query, [userId, targetDate]);
  return result.rows[0] || null;
};

