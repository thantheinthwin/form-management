import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface DecodedUser {
  id: number;
  role: "admin" | "user";
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "Access Denied" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as DecodedUser;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid Token" });
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Access Denied" });
    return;
  }
  next();
}