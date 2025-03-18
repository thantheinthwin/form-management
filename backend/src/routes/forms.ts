import express, { Request, Response } from "express";
import pool from "../config/db";
import { isAdmin } from "../middleware/auth";

const router = express.Router();

// Update the interface to match frontend expectations
interface Form {
  id: number;
  title: string;
  description: string;
  questions: any[];
  createdBy: number;
  createdAt: string;
  totalAssignments: number;
  completedAssignments: number;
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
    // Query that joins forms with assignments to get the required counts
    const query = `
      SELECT 
        f.id,
        f.title,
        f.description,
        f.questions,
        u.name as createdBy,
        f.created_at as createdAt,
        (
          SELECT COUNT(*) 
          FROM user_form_assignments 
          WHERE form_id = f.id
        ) as totalAssignments,
        (
          SELECT COUNT(*) 
          FROM user_form_assignments 
          WHERE form_id = f.id AND status = 'completed'
        ) as completedAssignments
      FROM forms f
      LEFT JOIN users u ON f.created_by = u.id
      ORDER BY f.created_at DESC
    `;
    
    const [rows] = await pool.query(query);
    
    // Transform the data to match the frontend interface
    const forms = (rows as any[]).map(form => {
      // Safely parse JSON with error handling
      let parsedQuestions = [];
      try {
        // Check if questions is already an object (prevent double parsing)
        if (typeof form.questions === 'string') {
          parsedQuestions = JSON.parse(form.questions);
        } else {
          // If it's already an object, use it directly
          parsedQuestions = form.questions;
        }
      } catch (e) {
        console.error(`Error parsing questions JSON for form ${form.id}:`, e);
        console.error(`Raw questions data:`, form.questions);
        // Provide an empty array as fallback
        parsedQuestions = [];
      }
      
      return {
        id: form.id,
        title: form.title,
        description: form.description,
        questions: parsedQuestions,
        createdBy: form.createdBy,
        createdAt: form.createdAt,
        totalAssignments: form.totalAssignments || 0,
        completedAssignments: form.completedAssignments || 0
      };
    });
    
    res.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/forms/:id - Get a single form by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const formId = req.params.id;

    // Similar query as GET all forms, but filtered for a specific form ID
    const query = `
      SELECT 
        f.id,
        f.title,
        f.description,
        f.questions,
        f.created_by as createdBy,
        f.created_at as createdAt,
        (
          SELECT COUNT(*) 
          FROM user_form_assignments 
          WHERE form_id = f.id
        ) as totalAssignments,
        (
          SELECT COUNT(*) 
          FROM user_form_assignments 
          WHERE form_id = f.id AND status = 'completed'
        ) as completedAssignments
      FROM forms f
      WHERE f.id = ?
    `;
    
    const [rows] = await pool.query(query, [formId]);
    
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ message: "Form not found" });
      return;
    }
    
    // Transform to match frontend interface
    const form = rows[0] as any;

    // Safely parse JSON with error handling
    let parsedQuestions = [];
    try {
      // Check if questions is already an object (prevent double parsing)
      if (typeof form.questions === 'string') {
        parsedQuestions = JSON.parse(form.questions);
      } else {
        // If it's already an object, use it directly
        parsedQuestions = form.questions;
      }
    } catch (e) {
      console.error(`Error parsing questions JSON for form ${form.id}:`, e);
      console.error(`Raw questions data:`, form.questions);
      // Provide an empty array as fallback
      parsedQuestions = [];
    }

    const formData = {
      id: form.id,
      title: form.title,
      description: form.description,
      questions: parsedQuestions,
      createdBy: form.createdBy,
      createdAt: form.createdAt,
      totalAssignments: form.totalAssignments || 0,
      completedAssignments: form.completedAssignments || 0
    };
    
    res.json(formData);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE /api/forms/:id - Delete a form by ID (admin only)
router.delete("/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const formId = req.params.id;
    const userId = req.user?.id;

    // Check if user exists (should always exist because of isAdmin middleware)
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // First check if the form exists
    const [checkResult] = await pool.query("SELECT id FROM forms WHERE id = ?", [formId]);
    
    if (!Array.isArray(checkResult) || checkResult.length === 0) {
      res.status(404).json({ message: "Form not found" });
      return;
    }

    // Delete form assignments first to maintain referential integrity
    await pool.query("DELETE FROM user_form_assignments WHERE form_id = ?", [formId]);
    
    // Delete responses for this form
    await pool.query("DELETE FROM responses WHERE form_id = ?", [formId]);
    
    // Finally delete the form
    await pool.query("DELETE FROM forms WHERE id = ?", [formId]);
    
    res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/forms/:id/assign - Assign a form to users (admin only)
router.post("/:id/assign", isAdmin, async (req: Request, res: Response) => {
  try {
    const formId = req.params.id;
    const { userIds } = req.body;
    
    // Validate userIds
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ message: "User IDs array is required" });
      return;
    }
    
    // Check if form exists
    const [formCheck] = await pool.query("SELECT id FROM forms WHERE id = ?", [formId]);
    
    if (!Array.isArray(formCheck) || formCheck.length === 0) {
      res.status(404).json({ message: "Form not found" });
      return;
    }
    
    // Check if all users exist
    const userIdPlaceholders = userIds.map(() => '?').join(',');
    const [userCheck] = await pool.query(
      `SELECT id FROM users WHERE id IN (${userIdPlaceholders})`, 
      userIds
    );
    
    if (!Array.isArray(userCheck) || userCheck.length !== userIds.length) {
      res.status(400).json({ message: "One or more users not found" });
      return;
    }
    
    // Insert assignments for each user
    // Use a transaction to ensure all assignments are created or none
    await pool.query('START TRANSACTION');
    
    try {
      for (const userId of userIds) {
        // First check if assignment already exists to avoid duplicates
        const [existingAssignment] = await pool.query(
          "SELECT id FROM user_form_assignments WHERE user_id = ? AND form_id = ?", 
          [userId, formId]
        );
        
        if (!Array.isArray(existingAssignment) || existingAssignment.length === 0) {
          await pool.query(
            "INSERT INTO user_form_assignments (user_id, form_id, status) VALUES (?, ?, 'pending')",
            [userId, formId]
          );
        }
      }
      
      await pool.query('COMMIT');
      res.status(201).json({ 
        message: "Form assigned successfully",
        assignedTo: userIds
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error assigning form:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
