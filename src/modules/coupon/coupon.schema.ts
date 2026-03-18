import { z } from "zod";

export const createCouponSchema = z.object({
  discountPercent: z
    .number({ message: "Discount percent must be a number" })
    .int({ message: "Discount percent must be a whole number" })
    .min(1, { message: "Discount percent must be at least 1%" })
    .max(50, { message: "Discount percent cannot exceed 50%" }),
  maxUses: z
    .number({ message: "Max uses must be a number" })
    .int({ message: "Max uses must be a whole number" })
    .min(1, { message: "Max uses must be at least 1" })
    .max(100, { message: "Max uses cannot exceed 100" })
    .optional()
    .default(1),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Expiry date must be in YYYY-MM-DD format" })
    .optional(),
  note: z.string().max(200, { message: "Note cannot exceed 200 characters" }).optional().default(""),
  code: z.string().min(1, { message: "Code cannot be empty" }).max(32, { message: "Code cannot exceed 32 characters" }).optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, { message: "Coupon code is required" }),
});

export const couponIdParamSchema = z.object({
  id: z.string().length(24, { message: "Invalid MongoDB ID format" }),
});

export type CreateCouponDTO = z.infer<typeof createCouponSchema>;
export type ValidateCouponDTO = z.infer<typeof validateCouponSchema>;
export type CouponIdParamDTO = z.infer<typeof couponIdParamSchema>;
