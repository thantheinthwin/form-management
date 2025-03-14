import express from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import dotenv from "dotenv";
import { Request, Response } from "express";
import type {StringValue} from 'ms';

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

  // Fixed JWT signing with proper types
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "Server configuration error" });
    return;
  }

  const signOptions: SignOptions = {
    expiresIn: process.env.JWT_EXPIRATION as StringValue || "1H"
  };

  const token = jwt.sign(
    { id: user.id, role: user.role },
    secret,
    signOptions
  );

  res.json({ token, role: user.role });
});

export default router;