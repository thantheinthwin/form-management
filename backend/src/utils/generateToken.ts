import jwt from "jsonwebtoken";
import type {StringValue} from 'ms';

interface TokenPayload {
  id: number;
  role?: "admin" | "user";
}

// Define token lifetimes as constants for consistency
const ACCESS_TOKEN_LIFETIME = "15M"; // 15 minutes
const REFRESH_TOKEN_LIFETIME = "7D"; // 7 days

class TokenService {
    private static getSecret(key: string): string {
        const secret = process.env[key];
        if (!secret) {
          throw new Error(`Missing environment variable: ${key}`);
        }
        return secret;
      }

    private static generateToken(payload: TokenPayload, secretKey: string, expiresIn: StringValue): string {
        return jwt.sign(payload, this.getSecret(secretKey), { expiresIn });
    }

    static generateAccessToken(user: TokenPayload): string {
        return this.generateToken(
        { id: user.id, role: user.role },
        "JWT_SECRET",
        ACCESS_TOKEN_LIFETIME
        );
    }

    static generateRefreshToken(user: TokenPayload): string {
        return this.generateToken(
        { id: user.id },
        "REFRESH_SECRET",
        REFRESH_TOKEN_LIFETIME
        );
    }
}

export default TokenService;
