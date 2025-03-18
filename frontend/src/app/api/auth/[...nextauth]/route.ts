import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import type { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

// Define token lifetimes as constants to match backend
const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes buffer for refresh
const SESSION_LIFETIME_DAYS = 30; // 30 days (should be >= refresh token lifetime)

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
    };
    accessToken: string;
    refreshToken: string;
    error?: string;
  }
  interface User {
    id: string;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const response = await axios.post("http://localhost:5000/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          const { accessToken, refreshToken, role, id, email } = response.data;
          
          if (accessToken) {
            return {
              id,
              email,
              role,
              accessToken,
              refreshToken,
            };
          }
          return null;
        } catch (error) {
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: Save user data and tokens to JWT
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFETIME_MS;
        return token;
      }

      // We should refresh the token in advance before it expires
      // Refresh if it's about to expire in the next 5 minutes
      const willExpireSoon = 
        typeof token.accessTokenExpires === 'number' && 
        Date.now() >= token.accessTokenExpires - REFRESH_BUFFER_MS;
      
      // Already expired
      const isExpired = 
        typeof token.accessTokenExpires === 'number' && 
        Date.now() >= token.accessTokenExpires;

      // If token is not expired and not about to expire, return it
      if (!isExpired && !willExpireSoon) {
        return token;
      }

      // Token has expired or is about to expire, try to refresh it
      console.debug(isExpired ? "Token has expired" : "Token will expire soon, refreshing proactively");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          role: token.role as string,
        };
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        
        // Pass any token errors to the session so we can detect them
        if (token.error) {
          // @ts-ignore - NextAuth doesn't type this
          session.error = token.error;
        }
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token.refreshToken) {
        try {
          await axios.post("http://localhost:5000/auth/logout", {
            refreshToken: token.refreshToken,
          });
        } catch (error) {
          console.error("Failed to call /logout", error);
        }
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: SESSION_LIFETIME_DAYS * 24 * 60 * 60, // 30 days
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// 🔹 Function to Refresh Access Token
async function refreshAccessToken(token: any) {
  try {
    // If token doesn't have a refresh token, we can't refresh
    if (!token.refreshToken) {
      console.error("No refresh token available");
      return { ...token, error: "NoRefreshToken" };
    }

    console.debug("Refreshing access token...");
    
    const response = await axios.post("http://localhost:5000/auth/refresh", {
      refreshToken: token.refreshToken,
    });

    // Check if we got a successful response with an access token
    const data = response.data;
    if (!data.accessToken) {
      console.error("Refresh response didn't contain access token:", data);
      return { ...token, error: "RefreshTokenError" };
    }

    console.debug("Token refreshed successfully");

    return {
      ...token,
      accessToken: data.accessToken,
      // If we get a new refresh token, use it, otherwise keep the old one
      refreshToken: data.refreshToken || token.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
      error: undefined, // Clear any previous errors
    };
  } catch (error: any) {
    // Log more detailed error information
    console.error("Failed to refresh access token:", 
      error.response?.status, 
      error.response?.data || error.message
    );
    
    // Handle specific error responses
    if (error.response?.status === 403) {
      console.error("Refresh token is invalid or expired. User needs to log in again");
      return { ...token, error: "RefreshTokenExpired" };
    }
    
    // Return the old token but mark it with an error
    return { ...token, error: "RefreshTokenError" };
  }
}