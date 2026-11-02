import {
  getGoalsByUserId,
  createGoalRecord,
  updateGoalRecord,
  deleteGoalRecord,
} from "../models/goalModel.js";

export const fetchGoals = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const goals = await getGoalsByUserId(userId);
    return res.status(200).json({ success: true, goals });
  } catch (error) {
    next(error);
  }
};

export const addGoal = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { title, targetDescription, targetDate } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Goal title is required." });
    }

    const goal = await createGoalRecord({
      userId,
      title: title.trim(),
      targetDescription: targetDescription || "",
      targetDate: targetDate || null,
    });

    return res.status(201).json({ success: true, message: "Goal created successfully", goal });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;
    const { progress, completed } = req.body;

    const updated = await updateGoalRecord(parseInt(id, 10), userId, { progress, completed });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Goal not found." });
    }

    return res.status(200).json({ success: true, message: "Goal updated successfully", goal: updated });
  } catch (error) {
    next(error);
  }
};

export const removeGoal = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    const deleted = await deleteGoalRecord(parseInt(id, 10), userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Goal not found." });
    }

    return res.status(200).json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    next(error);
  }
};

