import { pool } from "../config/db.js";

/**
 * Contact Model: Stores contact messages, senders, timestamps, and geolocation.
 */

// Save a new contact message
export const createContactMessage = async ({
  name,
  email,
  topic = "feedback",
  message,
  location = "Unknown Location",
  ipAddress = null,
}) => {
  const result = await pool.query(
    `
    INSERT INTO contact_messages (
      name,
      email,
      topic,
      message,
      location,
      ip_address
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      name,
      email,
      topic,
      message,
      location,
      ip_address,
      status,
      created_at
    `,
    [name, email, topic, message, location, ipAddress]
  );

  return result.rows[0];
};

// Retrieve all contact messages for the admin panel dashboard
export const getAllContactMessages = async ({ limit = 100, offset = 0 } = {}) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      topic,
      message,
      location,
      ip_address,
      status,
      created_at
    FROM contact_messages
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2;
    `,
    [limit, offset]
  );

  return result.rows;
};

// Retrieve dashboard stats for the admin panel
export const getContactMessageStats = async () => {
  const countRes = await pool.query(`
    SELECT
      COUNT(*)::int AS total_count,
      COUNT(CASE WHEN status = 'unread' THEN 1 END)::int AS unread_count,
      MAX(created_at) AS latest_message_time
    FROM contact_messages;
  `);

  const locationRes = await pool.query(`
    SELECT
      location,
      COUNT(*)::int AS count
    FROM contact_messages
    WHERE location IS NOT NULL AND location != ''
    GROUP BY location
    ORDER BY count DESC
    LIMIT 5;
  `);

  return {
    total: countRes.rows[0]?.total_count || 0,
    unread: countRes.rows[0]?.unread_count || 0,
    latestTime: countRes.rows[0]?.latest_message_time || null,
    topLocations: locationRes.rows || [],
  };
};

// Update message status (e.g. 'read', 'unread')
export const updateContactMessageStatus = async (id, status) => {
  const result = await pool.query(
    `
    UPDATE contact_messages
    SET status = $1
    WHERE id = $2
    RETURNING *;
    `,
    [status, id]
  );

  return result.rows[0];
};

// Delete a contact message
export const deleteContactMessage = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM contact_messages
    WHERE id = $1
    RETURNING id;
    `,
    [id]
  );

  return result.rows[0];
};

