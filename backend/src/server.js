import "./loadenv.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { testConnection } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";

// CORS: Allow both localhost (dev) and production frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://kodbankingg-app.onrender.com",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
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

// In production, serve frontend static files and SPA fallback (when frontend is built)
if (isProduction) {
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  if (existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("/{*splat}", (req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }
}

app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log("Connected to Aiven MySQL successfully");
  } catch (err) {
    console.error("Failed to connect to Aiven MySQL:", err);
  }
  console.log(`Backend server listening on port ${PORT}`);
});

