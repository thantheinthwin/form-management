import { NextResponse } from "next/server";
import { getSessionWithAuth } from "@/lib/auth";

const BACKEND_URL = "http://localhost:5000/api";

// Mock data for development and testing
const mockFormsData = {
  "1": {
    id: 1,
    title: "Employee Onboarding",
    description: "Please complete this form to finish your onboarding process",
    createdBy: "Admin User",
    createdAt: "2023-03-10T10:00:00Z",
    totalAssignments: 10,
    completedAssignments: 7,
    questions: [
      {
        id: 1,
        text: "Full Name",
        type: "text",
        required: true,
        order: 0
      },
      {
        id: 2,
        text: "Email Address",
        type: "text",
        required: true,
        order: 1
      },
      {
        id: 3,
        text: "Department",
        type: "multiple_choice",
        options: ["Engineering", "Marketing", "Sales", "HR", "Finance"],
        required: true,
        order: 2
      }
    ]
  },
  "2": {
    id: 2,
    title: "Project Feedback",
    description: "Please provide your feedback on the recent project",
    createdBy: "Project Manager",
    createdAt: "2023-03-15T14:30:00Z",
    totalAssignments: 5,
    completedAssignments: 2,
    questions: [
      {
        id: 1,
        text: "How would you rate the project management?",
        type: "multiple_choice",
        options: ["Excellent", "Good", "Average", "Poor", "Very Poor"],
        required: true,
        order: 0
      },
      {
        id: 2,
        text: "What aspects of the project worked well?",
        type: "text",
        required: false,
        order: 1
      },
      {
        id: 3,
        text: "What could be improved?",
        type: "text",
        required: false,
        order: 2
      }
    ]
  }
};

/**
 * Get a single form by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionWithAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/forms/${params.id}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const form = await response.json();
    return NextResponse.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 });
  }
}

/**
 * Assign a form to users
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionWithAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userIds } = await request.json();

    const response = await fetch(`${BACKEND_URL}/forms/${params.id}/assign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error assigning form:", error);
    return NextResponse.json({ error: "Failed to assign form" }, { status: 500 });
  }
} 

/**
 * Delete a form by ID
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getSessionWithAuth();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const response = await fetch(`${BACKEND_URL}/forms/${params.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting form:", error);
      return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
    }
  }

  export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getSessionWithAuth();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { title, description, questions } = await request.json();

      const response = await fetch(`${BACKEND_URL}/forms/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, questions }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return NextResponse.json(result);
    } catch (error) {
      console.error("Error updating form:", error);
      return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
    }
  }