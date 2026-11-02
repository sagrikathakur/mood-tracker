import {
  createMoodLog,
  getMoodLogs,
  deleteMoodLog,
  getMoodCalendarData,
  getMoodCorrelationData,
} from "../models/moodModel.js";

export const addMoodLog = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { score, primaryEmotion, energyLevel, stressLevel, triggers, notes } = req.body;

    if (!score || score < 1 || score > 10) {
      return res.status(400).json({ success: false, message: "Mood score must be between 1 and 10." });
    }

    if (!primaryEmotion) {
      return res.status(400).json({ success: false, message: "Primary emotion is required." });
    }

    const log = await createMoodLog({
      userId,
      score: parseInt(score, 10),
      primaryEmotion,
      energyLevel: energyLevel ? parseInt(energyLevel, 10) : 3,
      stressLevel: stressLevel ? parseInt(stressLevel, 10) : 3,
      triggers: Array.isArray(triggers) ? triggers : [],
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Mood logged successfully",
      log,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchMoodLogs = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const limit = parseInt(req.query.limit, 10) || 30;
    const logs = await getMoodLogs(userId, limit);

    return res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchMoodCalendar = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;

    const calendar = await getMoodCalendarData(userId, year, month);

    return res.status(200).json({
      success: true,
      year,
      month,
      calendar,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchMoodCorrelation = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const correlation = await getMoodCorrelationData(userId);

    return res.status(200).json({
      success: true,
      correlation,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMoodLog = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    const deleted = await deleteMoodLog(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Mood log not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Mood entry removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

