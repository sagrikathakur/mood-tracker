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
import fs from "fs";

import { errorHandler } from "./middleware/errorHandler.js";
import { pool } from "./config/db.js";
import { initDb } from "./config/initDb.js";
import sanctuarySocket from "./socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Ensure chat-background.jpg is physically present in client/dist/
try {
  const srcBg = path.resolve(__dirname, "../client/src/assets/chat-background.jpg");
  const distDir = path.resolve(__dirname, "../client/dist");
  const distAssetsDir = path.resolve(distDir, "assets");
  const dstBg1 = path.resolve(distAssetsDir, "chat-background.jpg");
  const dstBg2 = path.resolve(distDir, "chat-background.jpg");

  if (fs.existsSync(srcBg)) {
    if (!fs.existsSync(distAssetsDir)) fs.mkdirSync(distAssetsDir, { recursive: true });
    fs.copyFileSync(srcBg, dstBg1);
    fs.copyFileSync(srcBg, dstBg2);
    fs.writeFileSync(
      path.resolve(__dirname, "../bg-copy-status.json"),
      JSON.stringify({ status: "success", timestamp: new Date().toISOString(), size: fs.statSync(srcBg).size })
    );
  }
} catch (copyErr) {
  console.error("[Static Asset Copy Error]:", copyErr.message);
}

const app = express();
const port = process.env.PORT || 3000;

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

app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin) || (req.headers.host && origin.includes(req.headers.host))) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  } else {
    res.header("Access-Control-Allow-Origin", allowedOrigins[0] || "*");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Max-Age", "86400");

  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/stickers", stickerRoutes);
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

const clientDistPath = path.join(__dirname, "../client/dist");
const chatBgPath = path.join(__dirname, "../client/src/assets/chat-background.jpg");

const serveChatBg = (req, res) => {
  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(chatBgPath);
};

app.get("/assets/chat-background.jpg", serveChatBg);
app.get("/chat-background.jpg", serveChatBg);
app.use(express.static(clientDistPath, { maxAge: "1d" }));

app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      res.status(200).send("Calm Me Developer Wellness API is running smoothly 🟢");
    }
  });
});

app.use(errorHandler);

const httpServer = http.createServer(app);

sanctuarySocket.init(httpServer, app);

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
      } catch (e) { }
      httpServer.listen(port, () => {
        console.log(`Calm Me Server is running on port ${port} 🚀`);
        initDb();
      });
    }, 1000);
  } else {
    console.error("[Server Error]", err.message);
  }
});

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
