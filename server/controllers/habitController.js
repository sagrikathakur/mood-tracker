import {
  getHabitsWithStatus,
  createHabit,
  toggleHabitCompletion,
  deleteHabit,
} from "../models/habitModel.js";

export const fetchHabits = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { date } = req.query;
    const habits = await getHabitsWithStatus(userId, date);

    return res.status(200).json({
      success: true,
      habits,
    });
  } catch (error) {
    next(error);
  }
};

export const addHabit = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { title, category, icon } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Habit title is required." });
    }

    const habit = await createHabit({
      userId,
      title: title.trim(),
      category: category || "mindfulness",
      icon: icon || "Check",
    });

    return res.status(201).json({
      success: true,
      message: "Habit created successfully",
      habit,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleHabit = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;
    const { date } = req.body;

    const result = await toggleHabitCompletion({
      habitId: parseInt(id, 10),
      userId,
      date,
    });

    return res.status(200).json({
      success: true,
      completed: result.completed,
    });
  } catch (error) {
    next(error);
  }
};

export const removeHabit = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    const deleted = await deleteHabit(parseInt(id, 10), userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Habit not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

