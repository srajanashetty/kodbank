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

// CORS: Allow localhost and any onrender.com subdomain
const allowedOrigins = [
  "http://localhost:5173",
  "https://kodbank-ge7g.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".onrender.com")) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Simple version check to confirm deployment
app.get("/api/version", (req, res) => {
  res.json({ version: "1.0.2", deployedAt: new Date().toISOString(), cors: "any-onrender-allowed" });
});

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

