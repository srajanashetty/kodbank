import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.AIVEN_DB_URL;
if (!DB_URL) {
  throw new Error("Missing AIVEN_DB_URL environment variable. Add it to your .env file.");
}

export const pool = mysql.createPool(DB_URL);

export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.query("SELECT 1");
  } finally {
    conn.release();
  }
}

