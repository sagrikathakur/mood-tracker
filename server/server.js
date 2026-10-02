import express from "express";
import dotenv from "dotenv";

dotenv.config();

// App instance
const app = express();

// Port
const port = process.env.PORT;

// Middleware
app.use(express.json());

// Route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});