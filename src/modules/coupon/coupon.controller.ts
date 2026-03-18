import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler.js";
import { createCouponSchema, validateCouponSchema, couponIdParamSchema } from "./coupon.schema.js";
import { createCoupon, getAllCoupons, validateCoupon, deactivateCoupon } from "./coupon.service.js";

export async function createCouponHandler(req: Request, res: Response) {
  try {
    const parsed = createCouponSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    const coupon = await createCoupon(parsed.data);
    return res.status(201).json(coupon);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Create Coupon Error:", error);
    return res.status(500).json({ message: "Failed to create coupon" });
  }
}

export async function getAllCouponsHandler(req: Request, res: Response) {
  try {
    const coupons = await getAllCoupons();
    return res.status(200).json(coupons);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Get All Coupons Error:", error);
    return res.status(500).json({ message: "Failed to fetch coupons" });
  }
}

export async function validateCouponHandler(req: Request, res: Response) {
  try {
    const parsed = validateCouponSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    const result = await validateCoupon(parsed.data.code);

    if (result.valid) {
      return res.status(200).json({
        valid: true,
        discountPercent: result.coupon.discountPercent,
        code: result.coupon.code,
      });
    } else {
      return res.status(400).json({ valid: false, message: result.message });
    }
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Validate Coupon Error:", error);
    return res.status(500).json({ message: "Failed to validate coupon" });
  }
}

export async function deactivateCouponHandler(req: Request, res: Response) {
  try {
    const parsed = couponIdParamSchema.safeParse(req.params);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    const coupon = await deactivateCoupon(parsed.data.id);
    return res.status(200).json(coupon);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Deactivate Coupon Error:", error);
    return res.status(500).json({ message: "Failed to deactivate coupon" });
  }
}
