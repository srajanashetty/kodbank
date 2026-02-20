import "./loadenv.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";

// CORS: use FRONTEND_URL in production, localhost in development
const corsOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: corsOrigin,
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

// In production, serve frontend static files and SPA fallback
if (isProduction) {
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
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

