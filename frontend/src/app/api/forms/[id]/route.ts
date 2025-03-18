import { NextResponse } from "next/server";
import { getSessionWithAuth } from "@/lib/auth";

const BACKEND_URL = "http://localhost:5000/api";

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