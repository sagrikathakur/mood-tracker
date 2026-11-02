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
  tags,
  isPrivate,
  stickers,
  imageUrls,
}) => {
  const normalizedMood =
    mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();

  const entry = await createJournalEntry({
    userId,
    mood: normalizedMood,
    content: content || "",
    entryDate: entryDate || null,
    tags: tags || [],
    isPrivate: isPrivate !== undefined ? isPrivate : true,
    stickers: stickers || [],
    imageUrls: imageUrls || [],
  });

  return entry;
};

export const fetchJournalEntries = async ({
  userId,
  mood,
  tag,
  startDate,
  endDate,
  search,
  page,
  limit,
}) => {
  return await getJournalEntries({
    userId,
    mood,
    tag,
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
  let normalizedMood = updateData.mood;
  if (normalizedMood) {
    normalizedMood =
      normalizedMood.charAt(0).toUpperCase() + normalizedMood.slice(1).toLowerCase();
  }

  const updated = await updateJournalEntry(id, userId, {
    ...updateData,
    mood: normalizedMood,
  });

  if (!updated) {
    const error = new Error("Journal entry not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

export const removeJournalEntry = async (id, userId) => {
  const deleted = await deleteJournalEntry(id, userId);
  if (!deleted) {
    const error = new Error("Journal entry not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }
  return deleted;
};

export const fetchJournalAnalytics = async (userId) => {
  return await getJournalStats(userId);
};
