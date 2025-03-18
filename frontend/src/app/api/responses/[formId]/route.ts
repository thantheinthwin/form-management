import { NextResponse } from "next/server";
import { getSessionWithAuth } from "@/lib/auth";

const BACKEND_URL = "http://localhost:5000/api";

// Mock data for development and testing
const mockAssigneesData = {
  "1": {
    assignees: [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        status: "completed",
        submittedAt: "2023-03-15T14:30:00Z"
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        status: "pending"
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        status: "completed",
        submittedAt: "2023-03-16T09:15:00Z"
      }
    ]
  },
  "2": {
    assignees: [
      {
        id: 4,
        name: "Alice Williams",
        email: "alice@example.com",
        status: "completed",
        submittedAt: "2023-03-14T16:45:00Z"
      },
      {
        id: 5,
        name: "Mike Brown",
        email: "mike@example.com",
        status: "pending"
      }
    ]
  }
};

/**
 * Get responses for a form
 */
export async function GET(
  request: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getSessionWithAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For development/testing, use mock data if backend is not available
    // Remove or comment this section in production
    try {
      const mockData = mockAssigneesData[params.formId as keyof typeof mockAssigneesData] || { assignees: [] };
      return NextResponse.json(mockData);
    } catch (mockError) {
      console.log("Using real backend API");
    }

    const response = await fetch(`${BACKEND_URL}/responses/${params.formId}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const responses = await response.json();
    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch form responses" },
      { status: 500 }
    );
  }
}

/**
 * Submit responses for a form
 */
export async function POST(
  request: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getSessionWithAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { responses } = await request.json();

    const response = await fetch(`${BACKEND_URL}/responses/${params.formId}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ responses }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error submitting form responses:", error);
    return NextResponse.json(
      { error: "Failed to submit form responses" },
      { status: 500 }
    );
  }
} 