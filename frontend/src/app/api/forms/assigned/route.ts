import { NextResponse } from "next/server";
import { getSessionWithAuth } from "@/lib/auth";

const BACKEND_URL = "http://localhost:5000/api";

/**
 * Fetch forms assigned to the current user from backend
 */
export async function GET(request: Request) {
  try {
    const session = await getSessionWithAuth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get status filter from query params if present
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    // Build endpoint URL with optional status parameter
    let endpointUrl = `${BACKEND_URL}/assigned/${session.user.id}`;
    if (status && (status === 'pending' || status === 'completed')) {
      endpointUrl += `?status=${status}`;
    }

    const response = await fetch(endpointUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If the endpoint doesn't exist, we need a fallback
      if (response.status === 404) {
        // Use mock data for now - in a production app, you'd implement this on the backend
        // This is just a placeholder until backend implementation is complete
        return NextResponse.json([
          {
            id: 1,
            title: "Employee Onboarding",
            description: "Please complete this form to finish your onboarding process",
            createdBy: "Admin User",
            totalAssignments: 1,
            completedAssignments: 0,
            createdAt: "2023-03-10T10:00:00Z",
            status: "pending"
          },
          {
            id: 2,
            title: "Project Feedback",
            description: "Please provide your feedback on the recent project",
            createdBy: "Project Manager",
            totalAssignments: 1,
            completedAssignments: 0,
            createdAt: "2023-03-15T14:30:00Z",
            status: "pending"
          }
        ]);
      }
      
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const forms = await response.json();
    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching assigned forms:", error);
    return NextResponse.json({ error: "Failed to fetch assigned forms" }, { status: 500 });
  }
} 