import express, { Request, Response } from "express";
import pool from "../config/db";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

interface Form {
  id: number;
  title: string;
  description: string;
  questions: any[];
  created_by: number;
}

// POST /api/forms - Create a new form (admin only)
// verifyToken middleware is already applied in server.ts
router.post("/", isAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, questions } = req.body;
    const userId = req.user?.id;

    // Check if user exists (should always exist because of isAdmin middleware)
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Validate required fields
    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    if (!questions || !Array.isArray(questions)) {
      res.status(400).json({ message: "Questions array is required" });
      return;
    }

    // Insert the form with questions as JSON
    const [result] = await pool.query(
      "INSERT INTO forms (title, description, questions, created_by) VALUES (?, ?, ?, ?)",
      [title, description, JSON.stringify(questions), userId]
    );

    // Get the ID of the newly created form
    const insertId = (result as any).insertId;

    res.status(201).json({ 
      message: "Form created successfully",
      formId: insertId
    });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/forms - Get all forms
// No need for verifyToken middleware as it's already applied in server.ts
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM forms");
    res.json(rows as Form[]);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
