
import express from "express";
import http from "http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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
import contactRoutes from "./routes/contactRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { pool } from "./config/db.js";
import { initDb } from "./config/initDb.js";
import sanctuarySocket from "./socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

// App instance
const app = express();

// Port
const port = process.env.PORT || 3000;

// 1. Lightweight Request Logger & Latency Telemetry
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api") && req.path !== "/api/health") {
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
      );
    }
  });
  next();
});

// 2. Security & CORS Middleware
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
  res.header("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours

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

// 3. Sensible Global Body Parser (2MB default prevents memory exhaustion DoS)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// 4. Static file serving for uploaded photos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 6. Health & Telemetry Endpoint (for production monitoring, Docker & Cloud hosts)
app.get("/api/health", async (req, res) => {
  const startPing = Date.now();
  try {
    await pool.query("SELECT 1;");
    const dbLatencyMs = Date.now() - startPing;

    return res.status(200).json({
      status: "healthy",
      service: "Calm Me Developer Sanctuary API",
      uptimeSeconds: Math.floor(process.uptime()),
      dbLatencyMs,
      memoryUsage: {
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: "degraded",
      service: "Calm Me Developer Sanctuary API",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Calm Me Developer Wellness API is running smoothly 🟢");
});

// 7. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/stickers", stickerRoutes);
// Dedicated larger 25MB body parser scoped strictly to photo uploads
app.use("/api/upload", express.json({ limit: "25mb" }), uploadRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/admin", adminRoutes);

// Error handler middleware
app.use(errorHandler);

// Create HTTP server supporting both Express & real-time Socket.IO
const httpServer = http.createServer(app);

// Initialize Socket.IO & Real-Time Messenger
sanctuarySocket.init(httpServer, app);

// Listen & initialize DB tables & Server
const server = httpServer.listen(port, () => {
  console.log(`Calm Me Server is running on port ${port} 🚀`);
  initDb();
});

let retryTimeout = null;
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.warn(`[Server] Port ${port} is temporarily busy. Retrying in 1s...`);
    clearTimeout(retryTimeout);
    retryTimeout = setTimeout(() => {
      try {
        server.close();
      } catch (e) {}
      httpServer.listen(port, () => {
        console.log(`Calm Me Server is running on port ${port} 🚀`);
        initDb();
      });
    }, 1000);
  } else {
    console.error("[Server Error]", err.message);
  }
});

// 8. Graceful Shutdown (drains DB pool connections on SIGTERM, SIGINT, & nodemon SIGUSR2)
const gracefulShutdown = async (signal, cb) => {
  console.log(`\nReceived ${signal}. Gracefully stopping server and closing DB connection pool...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log("PostgreSQL connection pool closed successfully.");
      if (cb) cb();
      else process.exit(0);
    } catch (err) {
      console.error("Error while closing database pool:", err.message);
      if (cb) cb();
      else process.exit(1);
    }
  });

  // Force exit if shutdown hangs after 8 seconds
  setTimeout(() => {
    console.error("Forceful shutdown triggered after timeout.");
    if (cb) cb();
    else process.exit(1);
  }, 8000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.once("SIGUSR2", () => {
  gracefulShutdown("SIGUSR2", () => {
    process.kill(process.pid, "SIGUSR2");
  });
});

export default app;
