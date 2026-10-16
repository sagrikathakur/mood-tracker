import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalStats,
} from "../models/journalModel.js";

export const addJournalEntry = async ({
  userId,
  mood,
  content,
  entryDate,
  stickers,
  imageUrls,
}) => {
  // Normalize mood (capitalize first letter, e.g. "happy" -> "Happy")
  const normalizedMood =
    mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();

  const entry = await createJournalEntry({
    userId,
    mood: normalizedMood,
    content: content || "",
    entryDate: entryDate || null,
    stickers: stickers || [],
    imageUrls: imageUrls || [],
  });

  return entry;
};

export const fetchJournalEntries = async ({
  userId,
  mood,
  startDate,
  endDate,
  search,
  page,
  limit,
}) => {
  return await getJournalEntries({
    userId,
    mood,
    startDate,
    endDate,
    search,
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
  });
};

export const fetchJournalEntryById = async (id, userId) => {
  const entry = await getJournalEntryById(id, userId);
  if (!entry) {
    const error = new Error("Journal entry not found");
    error.statusCode = 404;
    throw error;
  }
  return entry;
};

export const editJournalEntry = async (id, userId, updateData) => {
  if (updateData.mood) {
    updateData.mood =
      updateData.mood.charAt(0).toUpperCase() +
      updateData.mood.slice(1).toLowerCase();
  }

  const updatedEntry = await updateJournalEntry(id, userId, updateData);
  if (!updatedEntry) {
    const error = new Error("Journal entry not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }
  return updatedEntry;
};

export const removeJournalEntry = async (id, userId) => {
  const deleted = await deleteJournalEntry(id, userId);
  if (!deleted) {
    const error = new Error("Journal entry not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }
  return { message: "Journal entry deleted successfully" };
};

export const fetchJournalAnalytics = async (userId) => {
  return await getJournalStats(userId);
};
