import { generateJournalReflection } from "../services/aiService.js";

export const getReflectionInsights = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const days = parseInt(req.query.days, 10) || 7;

    const insights = await generateJournalReflection(userId, days);

    return res.status(200).json({
      success: true,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

