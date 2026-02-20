/**
 * Load .env before any other module - must be imported first in server.js
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
const result = dotenv.config({ path: envPath, quiet: true });

if (result.error && process.env.NODE_ENV !== "test") {
  console.warn("Could not load .env from", envPath, ":", result.error.message);
}
