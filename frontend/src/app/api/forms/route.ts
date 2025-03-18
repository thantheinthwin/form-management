import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const BACKEND_URL = "http://localhost:5000/api";

/**
 * Helper function to get session and validate user authentication.
 */
async function getSessionWithAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return null;
  }
  return session;
}

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
