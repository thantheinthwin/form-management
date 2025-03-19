import { NextResponse } from "next/server";
import { getSessionWithAuth } from "@/lib/auth";

const BACKEND_URL = "http://localhost:5000/api";

/**
 * Get a specific user's response for a form
 */
export async function GET(
  request: Request,
  { params }: { params: { formId: string; userId: string } }
) {
  try {
    const session = await getSessionWithAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${BACKEND_URL}/responses/${params.formId}/${params.userId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const formResponse = await response.json();
    return NextResponse.json(formResponse);
  } catch (error) {
    console.error("Error fetching form response:", error);
    return NextResponse.json(
      { error: "Failed to fetch form response" },
      { status: 500 }
    );
  }
}
