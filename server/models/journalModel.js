import { pool } from "../config/db.js";

// Helper to get formatted entry by ID with stickers and images
export const getJournalEntryById = async (id, userId) => {
  const query = `
    SELECT 
      j.id,
      j.user_id,
      j.mood,
      j.content,
      TO_CHAR(j.entry_date, 'YYYY-MM-DD') AS entry_date,
      j.created_at,
      j.updated_at,
      COALESCE(
        JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT('id', s.id, 'name', s.name, 'emoji', s.emoji, 'image_url', s.image_url)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS stickers,
      COALESCE(
        JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT('id', ji.id, 'image_url', ji.image_url, 'caption', ji.caption)
        ) FILTER (WHERE ji.id IS NOT NULL),
        '[]'
      ) AS images
    FROM journal_entries j
    LEFT JOIN journal_stickers js ON j.id = js.journal_entry_id
    LEFT JOIN stickers s ON js.sticker_id = s.id
    LEFT JOIN journal_images ji ON j.id = ji.journal_entry_id
    WHERE j.id = $1 AND j.user_id = $2
    GROUP BY j.id;
  `;

  const result = await pool.query(query, [id, userId]);
  return result.rows[0] || null;
};

// Create a journal entry
export const createJournalEntry = async ({
  userId,
  mood,
  content = "",
  entryDate = null,
  stickers = [],
  imageUrls = [],
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertEntryQuery = `
      INSERT INTO journal_entries (user_id, mood, content, entry_date)
      VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
      RETURNING id;
    `;
    const entryResult = await client.query(insertEntryQuery, [
      userId,
      mood,
      content,
      entryDate,
    ]);
    const entryId = entryResult.rows[0].id;

    // Attach stickers if provided
    if (Array.isArray(stickers) && stickers.length > 0) {
      for (const sticker of stickers) {
        let stickerId = Number(sticker);
        // If passed as emoji or name string, resolve sticker_id
        if (isNaN(stickerId)) {
          const stickerRow = await client.query(
            `SELECT id FROM stickers WHERE emoji = $1 OR name ILIKE $1 LIMIT 1;`,
            [sticker]
          );
          if (stickerRow.rows.length > 0) {
            stickerId = stickerRow.rows[0].id;
          } else {
            // Insert custom emoji sticker
            const newSticker = await client.query(
              `INSERT INTO stickers (name, emoji) VALUES ($1, $1) RETURNING id;`,
              [sticker]
            );
            stickerId = newSticker.rows[0].id;
          }
        }

        if (stickerId) {
          await client.query(
            `INSERT INTO journal_stickers (journal_entry_id, sticker_id) VALUES ($1, $2);`,
            [entryId, stickerId]
          );
        }
      }
    }

    // Attach images if provided
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (const url of imageUrls) {
        if (url) {
          await client.query(
            `INSERT INTO journal_images (journal_entry_id, image_url) VALUES ($1, $2);`,
            [entryId, url]
          );
        }
      }
    }

    await client.query("COMMIT");
    return await getJournalEntryById(entryId, userId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Get list of journal entries with filters and pagination
export const getJournalEntries = async ({
  userId,
  mood,
  startDate,
  endDate,
  search,
  page = 1,
  limit = 20,
}) => {
  const conditions = ["j.user_id = $1"];
  const params = [userId];

  if (mood) {
    params.push(mood);
    conditions.push(`LOWER(j.mood) = LOWER($${params.length})`);
  }

  if (startDate) {
    params.push(startDate);
    conditions.push(`j.entry_date >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    conditions.push(`j.entry_date <= $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(j.content ILIKE $${params.length} OR j.mood ILIKE $${params.length})`);
  }

  const whereClause = conditions.join(" AND ");

  // Count total matching rows
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM journal_entries j
    WHERE ${whereClause};
  `;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total, 10);

  // Fetch paginated entries with joined stickers and images
  const offset = (page - 1) * limit;
  params.push(limit);
  const limitIndex = params.length;
  params.push(offset);
  const offsetIndex = params.length;

  const dataQuery = `
    SELECT 
      j.id,
      j.user_id,
      j.mood,
      j.content,
      TO_CHAR(j.entry_date, 'YYYY-MM-DD') AS entry_date,
      j.created_at,
      j.updated_at,
      COALESCE(
        JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT('id', s.id, 'name', s.name, 'emoji', s.emoji, 'image_url', s.image_url)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS stickers,
      COALESCE(
        JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT('id', ji.id, 'image_url', ji.image_url, 'caption', ji.caption)
        ) FILTER (WHERE ji.id IS NOT NULL),
        '[]'
      ) AS images
    FROM journal_entries j
    LEFT JOIN journal_stickers js ON j.id = js.journal_entry_id
    LEFT JOIN stickers s ON js.sticker_id = s.id
    LEFT JOIN journal_images ji ON j.id = ji.journal_entry_id
    WHERE ${whereClause}
    GROUP BY j.id
    ORDER BY j.entry_date DESC, j.created_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex};
  `;

  const dataResult = await pool.query(dataQuery, params);

  return {
    entries: dataResult.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

// Update an existing journal entry
export const updateJournalEntry = async (
  id,
  userId,
  { mood, content, entryDate, stickers, imageUrls }
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check entry existence and ownership
    const checkResult = await client.query(
      `SELECT id FROM journal_entries WHERE id = $1 AND user_id = $2;`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const updates = [];
    const params = [id, userId];

    if (mood !== undefined) {
      params.push(mood);
      updates.push(`mood = $${params.length}`);
    }
    if (content !== undefined) {
      params.push(content);
      updates.push(`content = $${params.length}`);
    }
    if (entryDate !== undefined) {
      params.push(entryDate);
      updates.push(`entry_date = $${params.length}`);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    await client.query(
      `UPDATE journal_entries SET ${updates.join(", ")} WHERE id = $1 AND user_id = $2;`,
      params
    );

    // Update stickers if provided
    if (stickers !== undefined && Array.isArray(stickers)) {
      await client.query(`DELETE FROM journal_stickers WHERE journal_entry_id = $1;`, [id]);
      for (const sticker of stickers) {
        let stickerId = Number(sticker);
        if (isNaN(stickerId)) {
          const stickerRow = await client.query(
            `SELECT id FROM stickers WHERE emoji = $1 OR name ILIKE $1 LIMIT 1;`,
            [sticker]
          );
          if (stickerRow.rows.length > 0) {
            stickerId = stickerRow.rows[0].id;
          } else {
            const newSticker = await client.query(
              `INSERT INTO stickers (name, emoji) VALUES ($1, $1) RETURNING id;`,
              [sticker]
            );
            stickerId = newSticker.rows[0].id;
          }
        }
        if (stickerId) {
          await client.query(
            `INSERT INTO journal_stickers (journal_entry_id, sticker_id) VALUES ($1, $2);`,
            [id, stickerId]
          );
        }
      }
    }

    // Update images if provided
    if (imageUrls !== undefined && Array.isArray(imageUrls)) {
      await client.query(`DELETE FROM journal_images WHERE journal_entry_id = $1;`, [id]);
      for (const url of imageUrls) {
        if (url) {
          await client.query(
            `INSERT INTO journal_images (journal_entry_id, image_url) VALUES ($1, $2);`,
            [id, url]
          );
        }
      }
    }

    await client.query("COMMIT");
    return await getJournalEntryById(id, userId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (id, userId) => {
  const result = await pool.query(
    `DELETE FROM journal_entries WHERE id = $1 AND user_id = $2 RETURNING id;`,
    [id, userId]
  );
  return result.rows[0] || null;
};

// Analytics & Summary stats for user's dashboard
export const getJournalStats = async (userId) => {
  // 1. Total entries
  const totalResult = await pool.query(
    `SELECT COUNT(*) AS total FROM journal_entries WHERE user_id = $1;`,
    [userId]
  );
  const totalEntries = parseInt(totalResult.rows[0].total, 10);

  // 2. Mood breakdown
  const moodResult = await pool.query(
    `
    SELECT mood, COUNT(*) AS count
    FROM journal_entries
    WHERE user_id = $1
    GROUP BY mood
    ORDER BY count DESC;
    `,
    [userId]
  );
  const moodDistribution = moodResult.rows.map((r) => ({
    mood: r.mood,
    count: parseInt(r.count, 10),
  }));

  const mostFrequentMood = moodDistribution[0]?.mood || null;

  // 3. Weekly Overview (Past 7 days)
  const weeklyResult = await pool.query(
    `
    SELECT 
      TO_CHAR(entry_date, 'YYYY-MM-DD') AS date,
      TO_CHAR(entry_date, 'Dy') AS day,
      mood
    FROM journal_entries
    WHERE user_id = $1 AND entry_date >= CURRENT_DATE - INTERVAL '6 days'
    ORDER BY entry_date ASC;
    `,
    [userId]
  );

  // 4. Calculate Current Streak
  const streakResult = await pool.query(
    `
    SELECT DISTINCT entry_date
    FROM journal_entries
    WHERE user_id = $1 AND entry_date <= CURRENT_DATE
    ORDER BY entry_date DESC;
    `,
    [userId]
  );

  let currentStreak = 0;
  if (streakResult.rows.length > 0) {
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    const dates = streakResult.rows.map((r) => {
      const d = new Date(r.entry_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    // If today or yesterday is present, start counting
    const oneDayMs = 24 * 60 * 60 * 1000;
    const todayMs = checkDate.getTime();
    const yesterdayMs = todayMs - oneDayMs;

    let pointer = todayMs;
    if (!dates.includes(todayMs)) {
      if (dates.includes(yesterdayMs)) {
        pointer = yesterdayMs;
      } else {
        pointer = null;
      }
    }

    if (pointer !== null) {
      while (dates.includes(pointer)) {
        currentStreak++;
        pointer -= oneDayMs;
      }
    }
  }

  return {
    totalEntries,
    mostFrequentMood,
    moodDistribution,
    recentWeekly: weeklyResult.rows,
    currentStreak,
  };
};
