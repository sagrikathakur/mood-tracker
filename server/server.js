import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

// App instance
const app = express();

// Port
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// User routes
app.use("/api/users", userRoutes);

// Error handler middleware
app.use(errorHandler);

// Listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});