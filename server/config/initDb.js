import { pool } from "./db.js";

export const initDb = async () => {
  try {
    // 1. users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'user',
        google_id VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. refresh_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        revoked_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. journal_entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mood VARCHAR(50) NOT NULL,
        content TEXT,
        entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, entry_date DESC);
      CREATE INDEX IF NOT EXISTS idx_journal_mood ON journal_entries(user_id, mood);
    `);

    // 4. stickers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stickers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        emoji VARCHAR(50),
        image_url TEXT,
        category VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. journal_stickers junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_stickers (
        id SERIAL PRIMARY KEY,
        journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
        sticker_id INTEGER NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. journal_images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journal_images (
        id SERIAL PRIMARY KEY,
        journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Pre-populate default stickers if empty
    const stickerCount = await pool.query(`SELECT COUNT(*) FROM stickers;`);
    if (parseInt(stickerCount.rows[0].count, 10) === 0) {
      const defaultStickers = [
        { name: "Blossom", emoji: "🌸", category: "nature" },
        { name: "Rainbow", emoji: "🌈", category: "nature" },
        { name: "Star", emoji: "⭐", category: "symbols" },
        { name: "Heart", emoji: "❤️", category: "mood" },
        { name: "Coffee", emoji: "☕", category: "lifestyle" },
        { name: "Music", emoji: "🎵", category: "lifestyle" },
        { name: "Moon", emoji: "🌙", category: "nature" },
        { name: "Sparkles", emoji: "✨", category: "symbols" },
        { name: "Cat", emoji: "🐱", category: "animals" },
        { name: "Sunflower", emoji: "🌻", category: "nature" },
        { name: "Cake", emoji: "🎂", category: "celebration" },
        { name: "Beach", emoji: "🏖️", category: "travel" },
      ];

      for (const sticker of defaultStickers) {
        await pool.query(
          `INSERT INTO stickers (name, emoji, category) VALUES ($1, $2, $3);`,
          [sticker.name, sticker.emoji, sticker.category]
        );
      }
      console.log("Seeded default stickers successfully.");
    }

    console.log("PostgreSQL Database tables verified/initialized successfully.");
  } catch (error) {
    console.error("Database initialization notice:", error.message);
  }
};
