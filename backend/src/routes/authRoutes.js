import express from "express";
import bcrypt from "bcrypt";
import { signToken, decodeToken } from "../config/jwt.js";
import {
  createKodUser,
  findUserByUsername,
  insertUserToken,
  deleteTokenByToken,
} from "../repositories/userRepository.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { uid, uname, password, email, phone, role } = req.body || {};

    if (!uid || !uname || !password || !email || !phone) {
      return res
        .status(400)
        .json({ message: "uid, uname, password, email and phone are required" });
    }

    // enforce Customer role for this flow
    const normalizedRole = "Customer";

    const existing = await findUserByUsername(uname);
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await createKodUser({
      uid,
      username: uname,
      email,
      passwordHash,
      balance: 100000,
      phone,
      role: normalizedRole,
    });

    return res
      .status(201)
      .json({ message: "Registered successfully, please login." });
  } catch (err) {
    console.error("Register error:", err);
    const message =
      process.env.NODE_ENV === "development" && err.message
        ? err.message
        : "Registration failed";
    return res.status(500).json({ message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ username: user.username, role: user.role });
    const decoded = decodeToken(token);

    const expiry =
      decoded && decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 60 * 60 * 1000);

    await insertUserToken({
      uid: user.uid,
      token,
      expiry,
    });

    const cookieOptions = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiry,
      path: "/",
    };

    res
      .cookie("auth_token", token, cookieOptions)
      .status(200)
      .json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    const message =
      process.env.NODE_ENV === "development" && err.message
        ? err.message
        : "Login failed";
    return res.status(500).json({ message });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSiteValue = isProduction ? "none" : "lax";
  const secureFlag = isProduction ? "; Secure" : "";
  const clearCookieHeader = `auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=${sameSiteValue}${secureFlag}`;
  const clearCookieOptions = {
    httpOnly: true,
    sameSite: sameSiteValue,
    secure: isProduction,
    path: "/",
    maxAge: 0,
  };

  try {
    const token = req.cookies?.auth_token;

    // Delete token from database FIRST - CRITICAL: invalidates token immediately
    if (token) {
      const deleted = await deleteTokenByToken(token);
      if (!deleted) {
        console.warn("Token deletion returned false - token may not have existed");
      }
    }

    // Clear cookie using multiple methods to ensure it's removed
    res.setHeader("Set-Cookie", clearCookieHeader);
    res.clearCookie("auth_token", clearCookieOptions);

    // Set empty cookie with expired date as additional safeguard
    res.cookie("auth_token", "", {
      ...clearCookieOptions,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    // Still clear cookie even on DB error - ensure client is logged out
    res.setHeader("Set-Cookie", clearCookieHeader);
    res.clearCookie("auth_token", clearCookieOptions);
    res.cookie("auth_token", "", {
      ...clearCookieOptions,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logout successful" });
  }
});

export default router;

