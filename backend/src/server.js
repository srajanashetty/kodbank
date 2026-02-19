import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { testConnection } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", message: "pong" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log("Connected to Aiven MySQL successfully");
  } catch (err) {
    console.error("Failed to connect to Aiven MySQL:", err);
  }
  console.log(`Backend server listening on port ${PORT}`);
});

