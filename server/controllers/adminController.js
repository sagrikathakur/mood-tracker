import { pool } from "../config/db.js";

/**
 * Admin Controller for Calm Me
 * Provides centralized administrative telemetry, user moderation, and support oversight.
 */

// 1. Overview & Telemetry Dashboard Metrics
export const getAdminOverview = async (req, res, next) => {
  try {
    // Parallel database counts
    const [
      usersCountRes,
      journalsCountRes,
      moodsCountRes,
      messagesCountRes,
      habitsCountRes,
      newUsersWeekRes,
      recentUsersRes,
      recentMessagesRes,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM users;`),
      pool.query(`SELECT COUNT(*)::int AS count FROM journal_entries;`),
      pool.query(`SELECT COUNT(*)::int AS count FROM mood_logs;`),
      pool.query(`SELECT COUNT(*)::int AS count FROM contact_messages;`),
      pool.query(`SELECT COUNT(*)::int AS count FROM habits;`),
      pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE created_at >= NOW() - INTERVAL '7 days';`),
      pool.query(`
        SELECT id, name, email, role, is_active, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5;
      `),
      pool.query(`
        SELECT id, name, email, topic, status, created_at 
        FROM contact_messages 
        ORDER BY created_at DESC 
        LIMIT 5;
      `),
    ]);

    // System telemetry
    const memory = process.memoryUsage();
    const telemetry = {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      memoryHeapUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(2),
      memoryHeapTotalMB: (memory.heapTotal / 1024 / 1024).toFixed(2),
      dbPool: {
        totalCount: pool.totalCount || 1,
        idleCount: pool.idleCount || 1,
        waitingCount: pool.waitingCount || 0,
      },
    };

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: usersCountRes.rows[0]?.count || 0,
        totalJournals: journalsCountRes.rows[0]?.count || 0,
        totalMoodLogs: moodsCountRes.rows[0]?.count || 0,
        totalInquiries: messagesCountRes.rows[0]?.count || 0,
        totalHabits: habitsCountRes.rows[0]?.count || 0,
        newUsersThisWeek: newUsersWeekRes.rows[0]?.count || 0,
      },
      recentUsers: recentUsersRes.rows || [],
      recentMessages: recentMessagesRes.rows || [],
      telemetry,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Registered Users with Activity Metrics
export const getAdminUsers = async (req, res, next) => {
  try {
    const { search = "", role = "all" } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.is_active,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT j.id)::int AS journal_count,
        COUNT(DISTINCT m.id)::int AS mood_count
      FROM users u
      LEFT JOIN journal_entries j ON j.user_id = u.id
      LEFT JOIN mood_logs m ON m.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length})`;
    }

    if (role !== "all") {
      params.push(role);
      query += ` AND u.role = $${params.length}`;
    }

    query += `
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `;

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Update User Role (Promote to Admin or Demote to User)
export const updateAdminUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Must be 'admin' or 'user'." });
    }

    const currentAdminId = req.user.id || req.user.userId;
    if (String(currentAdminId) === String(id) && role !== "admin") {
      return res.status(400).json({ success: false, message: "You cannot revoke your own administrator privileges." });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role, is_active, updated_at;
      `,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}.`,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update User Active / Suspended Status
export const updateAdminUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({ success: false, message: "is_active must be a boolean." });
    }

    const currentAdminId = req.user.id || req.user.userId;
    if (String(currentAdminId) === String(id) && is_active === false) {
      return res.status(400).json({ success: false, message: "You cannot suspend your own account." });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role, is_active, updated_at;
      `,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: is_active ? "User account activated." : "User account suspended.",
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete User Account
export const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user.id || req.user.userId;

    if (String(currentAdminId) === String(id)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, name, email;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: `User ${result.rows[0].email} permanently deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

