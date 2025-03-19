import express, { Request, Response } from "express";
import pool from "../config/db";

const router = express.Router();

// POST /api/responses/:formId/submit - Submit a form response
router.post("/:formId/submit", async (req: Request, res: Response) => {
  try {
    const formId = parseInt(req.params.formId);
    const userId = req.user?.id; // From the auth middleware
    const { responses } = req.body;

    // Validate inputs
    if (!formId || isNaN(formId)) {
       res.status(400).json({ message: "Invalid form ID" });
       return;
    }

    if (!userId) {
       res.status(401).json({ message: "User not authenticated" });
       return;
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
       res.status(400).json({ message: "No responses provided" });
       return;
    }

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if the form exists
      const [formRows] = await connection.query(
        "SELECT id FROM forms WHERE id = ?",
        [formId]
      );

      if (!Array.isArray(formRows) || formRows.length === 0) {
        await connection.rollback();
        res.status(404).json({ message: "Form not found" });
        return;
      }

      // Check if the user is assigned to this form
      const [assignmentRows] = await connection.query(
        "SELECT id, status FROM user_form_assignments WHERE user_id = ? AND form_id = ?",
        [userId, formId]
      );

      if (!Array.isArray(assignmentRows) || assignmentRows.length === 0) {
        await connection.rollback();
        res.status(403).json({ message: "You are not assigned to this form" });
        return;
      }

      const assignment = assignmentRows[0] as { id: number; status: string };

      // Check if the form has already been completed by this user
      if (assignment.status === "completed") {
        await connection.rollback();
        res.status(400).json({ message: "You have already submitted this form" });
        return;
      }

      // Store the response data
      const answersJson = JSON.stringify(responses);
      
      // Check if a response already exists
      const [existingResponseRows] = await connection.query(
        "SELECT id FROM responses WHERE user_id = ? AND form_id = ?",
        [userId, formId]
      );
      
      if (Array.isArray(existingResponseRows) && existingResponseRows.length > 0) {
        // Update existing response
        await connection.query(
          "UPDATE responses SET answers = ?, submitted_at = NOW() WHERE user_id = ? AND form_id = ?",
          [answersJson, userId, formId]
        );
      } else {
        // Insert new response
        await connection.query(
          "INSERT INTO responses (user_id, form_id, answers) VALUES (?, ?, ?)",
          [userId, formId, answersJson]
        );
      }

      // Update the assignment status to completed
      await connection.query(
        "UPDATE user_form_assignments SET status = 'completed' WHERE id = ?",
        [assignment.id]
      );

      await connection.commit();
      
      res.status(201).json({ message: "Form response submitted successfully" });
    } catch (error) {
      await connection.rollback();
      console.error("Transaction error:", error);
      res.status(500).json({ message: "Error submitting form response" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error submitting form response:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/responses/:userId/submissions - Get all submissions for a user
router.get("/:userId/submissions", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const currentUserId = req.user?.id;

    // Validate inputs
    if (!userId || isNaN(userId)) {
       res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    // Users can only view their own submissions unless they're admins
    if (userId !== currentUserId && req.user?.role !== "admin") {
       res.status(403).json({ message: "Unauthorized access" });
        return;
    }

    // Fetch all submissions for the user
    const [rows] = await pool.query(
      `SELECT 
        r.id,
        r.form_id as formId,
        f.title as formTitle,
        r.answers,
        r.submitted_at as submittedAt
      FROM responses r
      JOIN forms f ON r.form_id = f.id
      WHERE r.user_id = ?
      ORDER BY r.submitted_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/responses/:formId/:userId - Get a user's response to a specific form
router.get("/:formId/:userId", async (req: Request, res: Response) => {
  try {
    const formId = parseInt(req.params.formId);
    const userId = parseInt(req.params.userId);
    const currentUserId = req.user?.id;

    // Validate inputs
    if (!formId || isNaN(formId) || !userId || isNaN(userId)) {
      res.status(400).json({ message: "Invalid form ID or user ID" });
      return;
    }

    // Users can only view their own responses unless they're admins
    if (userId !== currentUserId && req.user?.role !== "admin") {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    // Fetch the response for the specific form and user
    const [rows] = await pool.query(
      `SELECT 
        r.id,
        r.form_id as formId,
        f.title as formTitle,
        f.questions,
        r.answers,
        r.submitted_at as submittedAt
      FROM responses r
      JOIN forms f ON r.form_id = f.id
      WHERE r.form_id = ? AND r.user_id = ?
      LIMIT 1`,
      [formId, userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ message: "No response found" });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching form response:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


export default router; 