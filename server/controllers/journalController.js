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
    const { mood, content, entryDate, tags, isPrivate, stickers, imageUrls } = req.body;

    const entry = await addJournalEntry({
      userId,
      mood,
      content,
      entryDate,
      tags,
      isPrivate,
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
    const { mood, tag, startDate, endDate, search, page, limit } = req.query;

    const result = await fetchJournalEntries({
      userId,
      mood,
      tag,
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

    const entry = await fetchJournalEntryById(parseInt(id, 10), userId);

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
    const { mood, content, entryDate, tags, isPrivate, stickers, imageUrls } = req.body;

    const entry = await editJournalEntry(parseInt(id, 10), userId, {
      mood,
      content,
      entryDate,
      tags,
      isPrivate,
      stickers,
      imageUrls,
    });

    return res.status(200).json({
      success: true,
      message: "Journal entry updated successfully",
      entry,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    await removeJournalEntry(parseInt(id, 10), userId);

    return res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId;
    const analytics = await fetchJournalAnalytics(userId);

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};
