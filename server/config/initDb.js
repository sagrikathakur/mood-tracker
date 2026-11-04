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

      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
      ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT TRUE;

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

    // 7. Dedicated multi-dimensional mood_logs table (Score 1-10, emotions, triggers, energy, stress)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mood_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
        primary_emotion VARCHAR(50) NOT NULL,
        energy_level INTEGER DEFAULT 3 CHECK (energy_level BETWEEN 1 AND 5),
        stress_level INTEGER DEFAULT 3 CHECK (stress_level BETWEEN 1 AND 10),
        triggers TEXT[] DEFAULT '{}',
        notes TEXT,
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_mood_logs_user_time ON mood_logs(user_id, recorded_at DESC);
    `);

    // 8. Habits & daily habit completion logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) DEFAULT 'mindfulness',
        target_frequency VARCHAR(30) DEFAULT 'daily',
        icon VARCHAR(50) DEFAULT 'check',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS habit_logs (
        id SERIAL PRIMARY KEY,
        habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
        UNIQUE(habit_id, completed_date)
      );

      CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, completed_date);
    `);

    // 9. Wellness metrics table (Sleep schedule & quality, water intake, screen time)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wellness_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        log_date DATE NOT NULL DEFAULT CURRENT_DATE,
        sleep_hours NUMERIC(4, 1) DEFAULT 7.0,
        sleep_quality INTEGER DEFAULT 3 CHECK (sleep_quality BETWEEN 1 AND 5),
        stress_level INTEGER DEFAULT 3 CHECK (stress_level BETWEEN 1 AND 10),
        water_glasses INTEGER DEFAULT 0,
        screen_time_hours NUMERIC(4, 1) DEFAULT 0.0,
        notes TEXT,
        UNIQUE(user_id, log_date)
      );

      CREATE INDEX IF NOT EXISTS idx_wellness_user_date ON wellness_metrics(user_id, log_date DESC);
    `);

    // 10. Personal Wellness Goals
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wellness_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        target_description TEXT,
        target_date DATE,
        progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_wellness_goals_user ON wellness_goals(user_id);
    `);

    // 11. AI Reflections cache
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_reflections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        summary TEXT NOT NULL,
        recurring_themes TEXT[] DEFAULT '{}',
        reflection_prompts TEXT[] DEFAULT '{}',
        sentiment_shift VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ai_reflections_user ON ai_reflections(user_id, created_at DESC);
    `);

    // 12. Contact Messages Table (for Inbound Mail, Nodemailer, Admin Panel Dashboard)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        topic VARCHAR(100) DEFAULT 'feedback',
        message TEXT NOT NULL,
        location VARCHAR(255) DEFAULT 'Unknown Location',
        ip_address VARCHAR(100),
        status VARCHAR(50) DEFAULT 'unread',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
    `);

    // 13. Anxiety Calm Game Telemetry & Hall of Fame Leaderboard
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_scores (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        player_name VARCHAR(100) NOT NULL DEFAULT 'Zen Runner',
        mode VARCHAR(30) NOT NULL DEFAULT 'arcade',
        score INTEGER NOT NULL DEFAULT 0,
        distance INTEGER NOT NULL DEFAULT 0,
        max_combo INTEGER NOT NULL DEFAULT 0,
        stars_collected INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_game_scores_leaderboard ON game_scores(mode, score DESC);
      CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id, created_at DESC);
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
