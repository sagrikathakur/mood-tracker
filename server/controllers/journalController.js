import {
  addJournalEntry,
  fetchJournalEntries,
  fetchJournalEntryById,
  editJournalEntry,
  removeJournalEntry,
  fetchJournalAnalytics,
} from "../services/journalService.js";

export const createEntry = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { mood, content, entryDate, stickers, imageUrls } = req.body;

    const entry = await addJournalEntry({
      userId,
      mood,
      content,
      entryDate,
      stickers,
      imageUrls,
    });

    return res.status(201).json({
      success: true,
      message: "Journal entry created successfully",
      entry,
    });
  } catch (error) {
    next(error);
  }
};

export const getEntries = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { mood, startDate, endDate, search, page, limit } = req.query;

    const result = await fetchJournalEntries({
      userId,
      mood,
      startDate,
      endDate,
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getEntryById = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    const entry = await fetchJournalEntryById(id, userId);

    return res.status(200).json({
      success: true,
      entry,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEntry = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    const updatedEntry = await editJournalEntry(id, userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Journal entry updated successfully",
      entry: updatedEntry,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    const result = await removeJournalEntry(id, userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const stats = await fetchJournalAnalytics(userId);

    return res.status(200).json({
      success: true,
      analytics: stats,
    });
  } catch (error) {
    next(error);
  }
};
