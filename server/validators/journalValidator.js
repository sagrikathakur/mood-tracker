import { z } from "zod";

export const VALID_MOODS = [
  "Happy",
  "Calm",
  "Neutral",
  "Sad",
  "Angry",
  "Anxious",
  "Excited",
  "Tired",
];

export const createEntrySchema = z.object({
  mood: z.string().min(1, "Mood selection is required"),
  content: z.string().optional().default(""),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  stickers: z.array(z.union([z.number(), z.string()])).optional().default([]),
  imageUrls: z.array(z.string()).optional().default([]),
});

export const updateEntrySchema = z.object({
  mood: z.string().min(1).optional(),
  content: z.string().optional(),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  stickers: z.array(z.union([z.number(), z.string()])).optional(),
  imageUrls: z.array(z.string()).optional(),
});

export const filterQuerySchema = z.object({
  mood: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
