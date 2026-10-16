import express from "express";
import {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getAnalytics,
} from "../controllers/journalController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createEntrySchema,
  updateEntrySchema,
  filterQuerySchema,
} from "../validators/journalValidator.js";

const router = express.Router();

// All journal routes require authentication
router.use(authenticateToken);

// Analytics & summary (must be before /:id)
router.get("/analytics", getAnalytics);

// Create journal entry
router.post("/", validate(createEntrySchema), createEntry);

// Get all journal entries with optional filters (mood, date range, search, pagination)
router.get("/", validate(filterQuerySchema, "query"), getEntries);

// Get single entry by ID
router.get("/:id", getEntryById);

// Update entry
router.put("/:id", validate(updateEntrySchema), updateEntry);

// Delete entry
router.delete("/:id", deleteEntry);

export default router;
