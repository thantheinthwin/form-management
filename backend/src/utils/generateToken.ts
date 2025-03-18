import jwt from "jsonwebtoken";
import type {StringValue} from 'ms';

interface TokenPayload {
  id: number;
  role?: "admin" | "user";
}

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
        "15M"
        );
    }

    static generateRefreshToken(user: TokenPayload): string {
        return this.generateToken(
        { id: user.id },
        "REFRESH_SECRET",
        "7D"
        );
    }
}

export default TokenService;
