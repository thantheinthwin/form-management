import express, { Request, Response } from "express";
import pool from "../config/db";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE role != 'admin' ORDER BY name"
    );
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router; 