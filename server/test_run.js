import { pool } from "./config/db.js";
import { getHabitsWithStatus, toggleHabitCompletion } from "./models/habitModel.js";
import { getJournalEntries } from "./models/journalModel.js";

async function main() {
  try {
    const userRes = await pool.query("SELECT id, name, email FROM users LIMIT 1;");
    console.log("User:", userRes.rows);
    const userId = userRes.rows[0]?.id || 1;

    console.log("1. Testing getHabitsWithStatus...");
    const habits = await getHabitsWithStatus(userId);
    console.log("Habits count:", habits.length);

    if (habits.length > 0) {
      console.log("2. Testing toggleHabitCompletion with habitId:", habits[0].id);
      const toggleRes = await toggleHabitCompletion({ habitId: habits[0].id, userId, date: null });
      console.log("Toggle result:", toggleRes);
    }

    console.log("3. Testing getJournalEntries with page=1, limit=9...");
    const j = await getJournalEntries({ userId, page: 1, limit: 9 });
    console.log("Journal entries count:", j.entries.length);

    console.log("All DB queries succeeded!");
  } catch (err) {
    console.error("Caught error:", err);
  } finally {
    await pool.end();
  }
}

main();

