import { pool } from "../config/db.js";

export async function createKodUser({
  uid,
  username,
  email,
  passwordHash,
  balance,
  phone,
  role,
}) {
  const sql = `
    INSERT INTO kodusers (uid, username, email, password, balance, phone, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await pool.query(sql, [uid, username, email, passwordHash, balance, phone, role]);
}

export async function findUserByUsername(username) {
  const [rows] = await pool.query(
    "SELECT * FROM kodusers WHERE username = ?",
    [username],
  );
  return rows[0] || null;
}

export async function insertUserToken({ uid, token, expiry }) {
  const sql = `
    INSERT INTO UserToken (token, uid, expairy)
    VALUES (?, ?, ?)
  `;
  await pool.query(sql, [token, uid, expiry]);
}

export async function deleteTokenByToken(token) {
  const [result] = await pool.query("DELETE FROM UserToken WHERE token = ?", [token]);
  // Verify deletion - if no rows affected, token might not have existed
  if (result.affectedRows === 0) {
    console.warn("Token not found in database during logout:", token?.substring(0, 20) + "...");
  }
  return result.affectedRows > 0;
}

