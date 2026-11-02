import { pool } from "../config/db.js";

// Safe, non-diagnostic reflection generator
export const generateJournalReflection = async (userId, periodDays = 7) => {
  // 1. Fetch recent journals
  const journalRes = await pool.query(
    `SELECT id, mood, content, TO_CHAR(entry_date, 'YYYY-MM-DD') AS entry_date, tags
     FROM journal_entries
     WHERE user_id = $1 AND entry_date >= CURRENT_DATE - ($2 || ' days')::interval
     ORDER BY entry_date DESC;`,
    [userId, periodDays]
  );

  // 2. Fetch recent mood logs
  const moodRes = await pool.query(
    `SELECT score, primary_emotion, energy_level, stress_level, triggers,
            TO_CHAR(recorded_at, 'YYYY-MM-DD') AS log_date
     FROM mood_logs
     WHERE user_id = $1 AND recorded_at >= CURRENT_DATE - ($2 || ' days')::interval
     ORDER BY recorded_at ASC;`,
    [userId, periodDays]
  );

  // 3. Fetch wellness metrics
  const wellnessRes = await pool.query(
    `SELECT sleep_hours, sleep_quality, stress_level, water_glasses
     FROM wellness_metrics
     WHERE user_id = $1 AND log_date >= CURRENT_DATE - ($2 || ' days')::interval;`,
    [userId, periodDays]
  );

  const journals = journalRes.rows;
  const moods = moodRes.rows;
  const wellness = wellnessRes.rows;

  if (journals.length === 0 && moods.length === 0) {
    return {
      hasData: false,
      summary: "You don't have enough entries logged this week yet. Check in with your mood or write a brief journal entry to generate your personal reflection!",
      recurringThemes: [],
      reflectionPrompts: [
        "What is one small thing that brought you comfort today?",
        "How did your body feel when you woke up this morning?",
      ],
      disclaimer: "These reflections are descriptive observations of your journal logs, not clinical or diagnostic assessments.",
    };
  }

  // Topic & keyword frequency analysis
  const combinedText = journals.map((j) => `${j.mood} ${j.content || ""} ${(j.tags || []).join(" ")}`).join(" ").toLowerCase();
  
  const TOPIC_CATEGORIES = {
    "Work & Projects": ["work", "job", "career", "meeting", "deadline", "project", "boss", "client", "office", "code", "task", "busy"],
    "Rest & Sleep": ["sleep", "tired", "exhausted", "rest", "nap", "bed", "insomnia", "woke", "fatigue", "night"],
    "Relationships & Social": ["friend", "family", "partner", "call", "dinner", "conversation", "mom", "dad", "sister", "brother", "social", "love"],
    "Self-Care & Mindfulness": ["walk", "exercise", "nature", "breathe", "meditate", "tea", "coffee", "journal", "calm", "reading", "peace"],
    "Physical Wellbeing": ["headache", "body", "sick", "water", "gym", "workout", "stretching", "energy", "health"],
  };

  const detectedThemes = [];
  for (const [category, keywords] of Object.entries(TOPIC_CATEGORIES)) {
    const hits = keywords.filter((k) => combinedText.includes(k));
    if (hits.length > 0) {
      detectedThemes.push({ category, hits: hits.length });
    }
  }
  detectedThemes.sort((a, b) => b.hits - a.hits);
  const topThemes = detectedThemes.slice(0, 3).map((t) => t.category);

  // Stressor identification from mood triggers & stress level
  const triggerCounts = {};
  moods.forEach((m) => {
    (m.triggers || []).forEach((t) => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });
  const topStressor = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Average mood calculation
  const totalScore = moods.reduce((acc, m) => acc + m.score, 0);
  const avgMood = moods.length > 0 ? (totalScore / moods.length).toFixed(1) : null;

  // Average sleep calculation
  const totalSleep = wellness.reduce((acc, w) => acc + (parseFloat(w.sleep_hours) || 0), 0);
  const avgSleep = wellness.length > 0 ? (totalSleep / wellness.length).toFixed(1) : null;

  // Emotional trajectory / shift
  let emotionalTrajectory = "steady";
  if (moods.length >= 2) {
    const firstHalfAvg = moods.slice(0, Math.ceil(moods.length / 2)).reduce((a, b) => a + b.score, 0) / Math.ceil(moods.length / 2);
    const secondHalfAvg = moods.slice(Math.ceil(moods.length / 2)).reduce((a, b) => a + b.score, 0) / (moods.length - Math.ceil(moods.length / 2));
    if (secondHalfAvg - firstHalfAvg >= 1.2) {
      emotionalTrajectory = "upward, showing noticeable recovery and easing of tension";
    } else if (firstHalfAvg - secondHalfAvg >= 1.2) {
      emotionalTrajectory = "dipping, with increased fatigue or pressure toward the latter half";
    } else {
      emotionalTrajectory = "balanced and consistent across the recording window";
    }
  }

  // Build descriptive summary
  let summary = `Over the past ${periodDays} days, you logged ${journals.length} journal reflection${journals.length === 1 ? "" : "s"} and ${moods.length} emotional check-in${moods.length === 1 ? "" : "s"}. `;
  if (avgMood) summary += `Your average emotional comfort was rated ${avgMood}/10, with trends appearing ${emotionalTrajectory}. `;
  if (topThemes.length > 0) summary += `Prominent focal points in your writing included ${topThemes.join(" and ")}. `;
  if (topStressor) summary += `Frequently recorded influences or friction points were linked to "${topStressor}". `;
  if (avgSleep) summary += `Sleep averaged approximately ${avgSleep} hours per night. `;

  // Tailored reflection questions
  const reflectionPrompts = [];
  if (topStressor) {
    reflectionPrompts.push(`When "${topStressor}" created tension this week, what helped you find your footing?`);
  } else {
    reflectionPrompts.push("Looking back at this week, what was a moment where you felt most at peace with yourself?");
  }

  if (avgSleep && parseFloat(avgSleep) < 7) {
    reflectionPrompts.push("Your sleep logged slightly lower this week. What gentle wind-down ritual could you gift yourself tonight?");
  } else {
    reflectionPrompts.push("What is one lesson or feeling from these past few days that you want to carry forward gently?");
  }

  // Save to DB cache
  try {
    await pool.query(
      `INSERT INTO ai_reflections (user_id, period_start, period_end, summary, recurring_themes, reflection_prompts, sentiment_shift)
       VALUES ($1, CURRENT_DATE - ($2 || ' days')::interval, CURRENT_DATE, $3, $4, $5, $6);`,
      [userId, periodDays, summary, topThemes, reflectionPrompts, emotionalTrajectory]
    );
  } catch (err) {
    console.warn("Could not cache AI reflection:", err.message);
  }

  return {
    hasData: true,
    periodDays,
    avgMood: avgMood ? parseFloat(avgMood) : null,
    avgSleep: avgSleep ? parseFloat(avgSleep) : null,
    summary,
    recurringThemes: topThemes,
    reflectionPrompts,
    sentimentTrajectory: emotionalTrajectory,
    disclaimer: "Descriptive personal reflection only. Not a medical or diagnostic tool.",
  };
};

