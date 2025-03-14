import express, { Request, Response } from "express";
import pool from "../config/db";
import { verifyToken, isAdmin } from "../middleware/auth";

const router = express.Router();

interface Form {
  id: number;
  title: string;
  description: string;
  created_by: number;
}

router.post("/", verifyToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const adminId = req.user?.id;

    await pool.query("INSERT INTO forms (title, description, created_by) VALUES (?, ?, ?)", 
                     [title, description, adminId]);

    res.json({ message: "Form created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM forms");
    res.json(rows as Form[]);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
