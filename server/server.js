import express from "express";
import dotenv from "dotenv";
import path from "path";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import stickerRoutes from "./routes/stickerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import wellnessRoutes from "./routes/wellnessRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initDb } from "./config/initDb.js";

dotenv.config();

// App instance
const app = express();

// Port
const port = process.env.PORT || 3000;

// Security & CORS Middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Hardened Security Headers
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Body parser with 25MB limit for photos
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Static file serving for uploaded photos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Root route
app.get("/", (req, res) => {
  res.send("MindSpace Mental Wellness API is running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/stickers", stickerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);

// Error handler middleware
app.use(errorHandler);

// Listen & initialize DB tables
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  initDb();
});
