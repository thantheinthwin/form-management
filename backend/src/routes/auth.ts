import express from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import dotenv from "dotenv";
import { Request, Response } from "express";
import type {StringValue} from 'ms';
import TokenService from "../utils/generateToken";

dotenv.config();
const router = express.Router();

interface User {
  id: number;
  email: string;
  password: string;
  role: "admin" | "user";
}


router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const user = rows[0] as User;
  const passwordMatch = await bcrypt.compare(password, user.password);

  console.log('password', password, user.password)

  if (!passwordMatch) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  
  const accessToken = TokenService.generateAccessToken(user)
  const refreshToken = TokenService.generateRefreshToken(user)

  await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [refreshToken, user.id])

  res.json({ accessToken, refreshToken, id: user.id, email: user.email, role: user.role });
});

router.post("/refresh", async (req: Request, res: Response) => {
  const {refreshToken} = req.body;

  if(!refreshToken){
    res.status(403).json({message: "Refresh token required."})
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as { id: number };

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ? AND refresh_token = ?", [decoded.id, refreshToken]);

    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }

    const user = rows[0] as User;
    const newAccessToken = TokenService.generateAccessToken(user);

    console.log(`Generated new access token for user ${user.id}`);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
})

// ✅ Fix async function return type
router.post("/logout", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await pool.query("UPDATE users SET refresh_token = NULL WHERE refresh_token = ?", [refreshToken]);

  res.json({ message: "Logged out successfully" });
  return;
});

export default router;