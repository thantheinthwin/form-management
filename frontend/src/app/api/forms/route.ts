import { NextResponse } from "next/server";
import { getSessionWithAuth, handleAuthError } from "@/lib/auth";

const BACKEND_URL = "http://localhost:5000/api";

/**
 * Fetch forms from backend
 */
export async function GET() {
  try {
    const session = await getSessionWithAuth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/forms`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const forms = await response.json();
    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}

/**
 * Create a new form
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionWithAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.json();

    console.debug("Sending form creation request to backend");
    const response = await fetch(`${BACKEND_URL}/forms`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Handle specific status codes
    if (response.status === 401) {
      console.error("Authentication failed with backend - Invalid Token");
      
      // This will be caught by the client-side and trigger a redirect
      return NextResponse.json({ 
        error: "Authentication failed. Please log in again.",
        authError: true 
      }, { status: 401 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const createdForm = await response.json();
    return NextResponse.json(createdForm);
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
  }
}
