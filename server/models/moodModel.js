import { pool } from "../config/db.js";

// Create a new mood log
export const createMoodLog = async ({
  userId,
  score,
  primaryEmotion,
  energyLevel = 3,
  stressLevel = 3,
  triggers = [],
  notes = "",
}) => {
  const query = `
    INSERT INTO mood_logs (user_id, score, primary_emotion, energy_level, stress_level, triggers, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, user_id, score, primary_emotion, energy_level, stress_level, triggers, notes, recorded_at;
  `;
  const result = await pool.query(query, [
    userId,
    score,
    primaryEmotion,
    energyLevel,
    stressLevel,
    triggers,
    notes,
  ]);
  return result.rows[0];
};

// Get list of recent mood logs
export const getMoodLogs = async (userId, limit = 30) => {
  const query = `
    SELECT id, user_id, score, primary_emotion, energy_level, stress_level, triggers, notes, recorded_at,
           TO_CHAR(recorded_at, 'YYYY-MM-DD') AS log_date,
           TO_CHAR(recorded_at, 'HH12:MI AM') AS log_time
    FROM mood_logs
    WHERE user_id = $1
    ORDER BY recorded_at DESC
    LIMIT $2;
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
};

// Delete a mood log
export const deleteMoodLog = async (id, userId) => {
  const query = `
    DELETE FROM mood_logs
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0] || null;
};

// Get mood calendar aggregation for a specific year and month (or current month)
export const getMoodCalendarData = async (userId, year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
  const query = `
    SELECT 
      TO_CHAR(recorded_at, 'YYYY-MM-DD') AS date,
      ROUND(AVG(score), 1)::float AS avg_score,
      MODE() WITHIN GROUP (ORDER BY primary_emotion) AS dominant_emotion,
      COUNT(id)::int AS count,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', id,
          'score', score,
          'emotion', primary_emotion,
          'energy', energy_level,
          'stress', stress_level,
          'triggers', triggers,
          'notes', notes,
          'time', TO_CHAR(recorded_at, 'HH12:MI AM')
        ) ORDER BY recorded_at ASC
      ) AS entries
    FROM mood_logs
    WHERE user_id = $1
      AND EXTRACT(YEAR FROM recorded_at) = $2
      AND EXTRACT(MONTH FROM recorded_at) = $3
    GROUP BY TO_CHAR(recorded_at, 'YYYY-MM-DD')
    ORDER BY date ASC;
  `;
  const result = await pool.query(query, [userId, year, month]);
  return result.rows;
};

// Standout Feature: Mood + Journal Correlation Engine Data
export const getMoodCorrelationData = async (userId) => {
  // 1. Overall & 30-day stats
  const summaryRes = await pool.query(
    `SELECT 
       ROUND(AVG(score), 1)::float AS avg_mood,
       ROUND(AVG(stress_level), 1)::float AS avg_stress,
       ROUND(AVG(energy_level), 1)::float AS avg_energy,
       COUNT(id)::int AS total_logs
     FROM mood_logs
     WHERE user_id = $1;`,
    [userId]
  );

  // 2. Emotion frequency distribution
  const emotionRes = await pool.query(
    `SELECT primary_emotion AS emotion, COUNT(*)::int AS count
     FROM mood_logs
     WHERE user_id = $1
     GROUP BY primary_emotion
     ORDER BY count DESC
     LIMIT 8;`,
    [userId]
  );

  // 3. Weekly Mood Trend (Last 7 Days)
  const weeklyRes = await pool.query(
    `SELECT 
       TO_CHAR(recorded_at, 'Dy') AS day_name,
       TO_CHAR(recorded_at, 'YYYY-MM-DD') AS date,
       ROUND(AVG(score), 1)::float AS avg_score,
       ROUND(AVG(stress_level), 1)::float AS avg_stress
     FROM mood_logs
     WHERE user_id = $1 AND recorded_at >= CURRENT_DATE - INTERVAL '6 days'
     GROUP BY TO_CHAR(recorded_at, 'Dy'), TO_CHAR(recorded_at, 'YYYY-MM-DD'), DATE_TRUNC('day', recorded_at)
     ORDER BY DATE_TRUNC('day', recorded_at) ASC;`,
    [userId]
  );

  // 4. Trigger Impact Matrix (How triggers affect mood vs base average)
  const triggerRes = await pool.query(
    `SELECT 
       t.trigger_name,
       ROUND(AVG(m.score), 1)::float AS avg_score_with_trigger,
       COUNT(m.id)::int AS frequency
     FROM mood_logs m,
     UNNEST(m.triggers) AS t(trigger_name)
     WHERE m.user_id = $1 AND t.trigger_name IS NOT NULL AND t.trigger_name <> ''
     GROUP BY t.trigger_name
     HAVING COUNT(m.id) >= 1
     ORDER BY avg_score_with_trigger DESC;`,
    [userId]
  );

  // 5. Sleep vs. Mood correlation points (from wellness_metrics + mood_logs)
  const sleepCorrelationRes = await pool.query(
    `SELECT 
       w.log_date,
       w.sleep_hours::float AS sleep_hours,
       w.sleep_quality::int AS sleep_quality,
       ROUND(AVG(m.score), 1)::float AS mood_score
     FROM wellness_metrics w
     LEFT JOIN mood_logs m 
       ON m.user_id = w.user_id 
       AND TO_CHAR(m.recorded_at, 'YYYY-MM-DD') = TO_CHAR(w.log_date, 'YYYY-MM-DD')
     WHERE w.user_id = $1
     GROUP BY w.log_date, w.sleep_hours, w.sleep_quality
     ORDER BY w.log_date DESC
     LIMIT 14;`,
    [userId]
  );

  return {
    summary: summaryRes.rows[0] || { avg_mood: 0, avg_stress: 0, avg_energy: 0, total_logs: 0 },
    emotionDistribution: emotionRes.rows,
    weeklyTrend: weeklyRes.rows,
    triggerImpact: triggerRes.rows,
    sleepCorrelation: sleepCorrelationRes.rows,
  };
};

