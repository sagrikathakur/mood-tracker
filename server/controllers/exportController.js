import { pool } from "../config/db.js";

// Export complete data dump
export const exportUserData = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;

    // Fetch user profile (excluding hash)
    const userRes = await pool.query(
      `SELECT id, name, email, role, created_at FROM users WHERE id = $1;`,
      [userId]
    );

    // Fetch journals
    const journalsRes = await pool.query(
      `SELECT id, mood, content, TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date, tags, is_private, created_at
       FROM journal_entries WHERE user_id = $1 ORDER BY entry_date DESC;`,
      [userId]
    );

    // Fetch mood logs
    const moodsRes = await pool.query(
      `SELECT id, score, primary_emotion, energy_level, stress_level, triggers, notes, recorded_at
       FROM mood_logs WHERE user_id = $1 ORDER BY recorded_at DESC;`,
      [userId]
    );

    // Fetch habits & logs
    const habitsRes = await pool.query(
      `SELECT h.title, h.category, h.target_frequency, hl.completed_date
       FROM habits h
       LEFT JOIN habit_logs hl ON h.id = hl.habit_id
       WHERE h.user_id = $1;`,
      [userId]
    );

    // Fetch wellness metrics
    const wellnessRes = await pool.query(
      `SELECT TO_CHAR(log_date, 'YYYY-MM-DD') AS log_date, sleep_hours, sleep_quality, stress_level, water_glasses, screen_time_hours
       FROM wellness_metrics WHERE user_id = $1 ORDER BY log_date DESC;`,
      [userId]
    );

    const exportPackage = {
      exportedAt: new Date().toISOString(),
      user: userRes.rows[0],
      journals: journalsRes.rows,
      moodLogs: moodsRes.rows,
      habits: habitsRes.rows,
      wellnessMetrics: wellnessRes.rows,
    };

    res.setHeader("Content-Disposition", `attachment; filename=mindspace-export-${Date.now()}.json`);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(exportPackage, null, 2));
  } catch (error) {
    next(error);
  }
};

// Permanent GDPR Purge
export const purgeUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;

    // Due to ON DELETE CASCADE on foreign keys, deleting user wipes all their entries, moods, habits, and tokens
    await pool.query(`DELETE FROM users WHERE id = $1;`, [userId]);

    return res.status(200).json({
      success: true,
      message: "Account and all associated wellness records permanently erased.",
    });
  } catch (error) {
    next(error);
  }
};

