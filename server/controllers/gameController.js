import {
  saveGameScore,
  getLeaderboard,
  getUserBestScore,
  logRecoverySession,
} from "../models/gameModel.js";

/**
 * Controller for Anxiety Calm Game API
 */

// Submit game run score
export const submitScore = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId || null;
    const {
      playerName,
      mode = "arcade",
      score = 0,
      distance = 0,
      maxCombo = 0,
      starsCollected = 0,
    } = req.body;

    const saved = await saveGameScore({
      userId,
      playerName: playerName || req.user?.name || "Zen Runner",
      mode,
      score,
      distance,
      maxCombo,
      starsCollected,
    });

    // Check if this run is a personal best
    let isPersonalBest = false;
    if (userId) {
      const best = await getUserBestScore(userId, mode);
      if (best && best.id === saved.id) {
        isPersonalBest = true;
      }
    }

    return res.status(201).json({
      success: true,
      message: isPersonalBest ? "New Personal Best achieved!" : "Score recorded successfully.",
      run: saved,
      isPersonalBest,
    });
  } catch (error) {
    next(error);
  }
};

// Get top Hall of Fame scores
export const fetchLeaderboard = async (req, res, next) => {
  try {
    const mode = req.query.mode || "arcade";
    const limit = parseInt(req.query.limit, 10) || 10;

    const leaderboard = await getLeaderboard({ mode, limit });

    return res.status(200).json({
      success: true,
      mode,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// Record Sanctuary recovery session
export const recordRecovery = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must be signed in to log recovery sessions to your Sanctuary account.",
      });
    }

    const minutes = parseInt(req.body.minutes, 10) || 5;
    const session = await logRecoverySession(userId, minutes);

    return res.status(200).json({
      success: true,
      message: `Successfully logged ${minutes}-minute recovery session to your Sanctuary dashboard!`,
      session,
    });
  } catch (error) {
    next(error);
  }
};

