import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import type { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";

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
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000; // 15 min expiry
      }

      // If access token is still valid, return token
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Otherwise, refresh the access token
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// 🔹 Function to Refresh Access Token
async function refreshAccessToken(token: any) {
  try {
    const response = await axios.post("http://localhost:5000/auth/refresh", {
      refreshToken: token.refreshToken,
    });

    const refreshedTokens = response.data;

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000, // Set new expiry
    };
  } catch (error) {
    console.error("Failed to refresh access token", error);
    return { ...token, error: "RefreshTokenExpired" };
  }
}