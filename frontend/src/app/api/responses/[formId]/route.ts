import { NextResponse } from "next/server";
import { getSessionWithAuth } from "@/lib/auth";

const BACKEND_URL = "http://localhost:5000/api";

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