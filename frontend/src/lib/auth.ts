import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { signOut } from "next-auth/react";

/**
 * Helper function to get session and validate user authentication.
 * Returns null if user is not authenticated or if access token is missing.
 * Adds debug logging for token issues.
 */
export async function getSessionWithAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    console.debug("Auth error: No session found");
    return null;
  }
  
  if (!session.accessToken) {
    console.debug("Auth error: No access token in session");
    return null;
  }

  // Check if the token has error flags (set by the refreshAccessToken function)
  if (session.error) {
    console.error(`Auth error: Token error detected - ${session.error}`);
    return null;
  }
  
  // Log first few characters of token for debugging (safe to log this part)
  console.debug(`Using token: ${session.accessToken.substring(0, 10)}...`);
  
  return session;
}

/**
 * Handle token errors by logging the user out.
 * Call this function when API requests fail with 401 Unauthorized.
 */
export async function handleAuthError() {
  console.error("Authentication error detected, logging out user");
  // This will redirect the user to the login page
  await signOut({ callbackUrl: "/login?error=session_expired" });
} 