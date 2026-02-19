import { verifyToken } from "../config/jwt.js";
import { pool } from "../config/db.js";

export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = verifyToken(token);

    // Ensure token exists in DB and not expired
    const [rows] = await pool.query(
      "SELECT * FROM UserToken WHERE token = ? AND expairy > NOW()",
      [token],
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Token invalid or expired" });
    }

    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

