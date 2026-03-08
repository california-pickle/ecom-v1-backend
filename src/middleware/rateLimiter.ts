import rateLimit from "express-rate-limit";
import type { Request } from "express";

// 1. Tell TypeScript what your user object looks like
export interface CustomRequest extends Request {
  user?: {
    id: string;
    role: string;
    // Add any other user properties you track here
  };
}

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Practical limit for production

  // 2. Safely cast the request to your CustomRequest
  keyGenerator: (req: Request) => {
    const customReq = req as CustomRequest;

    // If auth middleware has run and we know who they are, limit by ID
    if (customReq.user?.id) {
      return customReq.user.id;
    }
    // Otherwise, limit by IP
    return customReq.ip || "unknown-ip";
  },

  skip: (req: Request) => {
    const customReq = req as CustomRequest;
    // Bypass entirely if the user is an admin
    return customReq.user?.role === "ADMIN";
  },

  message: {
    error: "You're moving too fast! Please slow down and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// It's smart to have a STRICTER limiter for auth routes (Login/Register)
// to prevent brute-force password guessing.
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8, // Only 8 login attempts per hour per IP
  message: {
    error: "Too many login attempts. Try again in an hour.",
  },
});
