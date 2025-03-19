import express, { Request, Response } from "express";
import pool from "../config/db";

const router = express.Router();

// GET /api/assigned/:userId - Get all forms assigned to a user with optional status filter
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const status = req.query.status as string | undefined;
    
    // Validate user ID
    if (isNaN(Number(userId))) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    // Check if user exists
    const [userCheck] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (!Array.isArray(userCheck) || userCheck.length === 0) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    // Build query with optional status filter
    let query = `
      SELECT 
        f.id,
        f.title,
        f.description,
        u.name as createdBy,
        f.created_at as createdAt,
        ufa.status
      FROM user_form_assignments ufa
      JOIN forms f ON ufa.form_id = f.id
      JOIN users u ON f.created_by = u.id
      WHERE ufa.user_id = ?
    `;
    
    const queryParams: any[] = [userId];
    
    // Add status filter if provided
    if (status && (status === 'pending' || status === 'completed')) {
      query += " AND ufa.status = ?";
      queryParams.push(status);
    }
    
    query += " ORDER BY f.created_at DESC";
    
    const [rows] = await pool.query(query, queryParams);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching assigned forms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router; 