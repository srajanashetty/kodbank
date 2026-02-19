import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { findUserByUsername } from "../repositories/userRepository.js";

const router = express.Router();

// GET /api/user/balance
// Protected route - requires valid JWT token via authMiddleware
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    // Extract username from JWT token (subject claim)
    const usernameFromToken = req.user?.sub;
    if (!usernameFromToken) {
      return res.status(401).json({ message: "Invalid token: username not found" });
    }

    // Fetch user from database using username from token
    const user = await findUserByUsername(usernameFromToken);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return balance only if user is authenticated and found
    // Prevent caching of balance response
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({ balance: user.balance });
  } catch (err) {
    console.error("Balance error:", err);
    return res.status(500).json({ message: "Failed to fetch balance" });
  }
});

export default router;

