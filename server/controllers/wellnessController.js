import {
  upsertWellnessMetric,
  getWellnessMetrics,
  getTodayMetric,
} from "../models/wellnessModel.js";
import kafkaService from "../services/kafkaService.js";

export const saveDailyMetrics = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const {
      logDate,
      sleepHours,
      sleepQuality,
      stressLevel,
      waterGlasses,
      screenTimeHours,
      notes,
    } = req.body;

    const metric = await upsertWellnessMetric({
      userId,
      logDate,
      sleepHours: sleepHours !== undefined ? parseFloat(sleepHours) : 7.0,
      sleepQuality: sleepQuality !== undefined ? parseInt(sleepQuality, 10) : 3,
      stressLevel: stressLevel !== undefined ? parseInt(stressLevel, 10) : 3,
      waterGlasses: waterGlasses !== undefined ? parseInt(waterGlasses, 10) : 0,
      screenTimeHours: screenTimeHours !== undefined ? parseFloat(screenTimeHours) : 0,
      notes: notes || "",
    });

    // Stream telemetry event to Kafka
    kafkaService.sendEvent(kafkaService.TOPICS.TELEMETRY, {
      userId,
      logDate,
      screenTimeHours,
      sleepHours,
      stressLevel,
      waterGlasses,
      timestamp: new Date().toISOString(),
    }, userId);

    return res.status(200).json({
      success: true,
      message: "Daily wellness metrics saved",
      metric,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchWellnessHistory = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const days = parseInt(req.query.days, 10) || 14;
    const history = await getWellnessMetrics(userId, days);

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    next(error);
  }
};

export const fetchTodayMetrics = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { date } = req.query;
    const today = await getTodayMetric(userId, date);

    return res.status(200).json({
      success: true,
      today,
    });
  } catch (error) {
    next(error);
  }
};
