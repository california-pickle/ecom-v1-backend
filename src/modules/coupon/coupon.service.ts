import { Coupon } from "./coupon.model.js";
import type { ICoupon } from "./coupon.model.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { CreateCouponDTO } from "./coupon.schema.js";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCouponCode(): string {
  let code = "PICKLE-";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function createCoupon(data: CreateCouponDTO): Promise<ICoupon> {
  const now = new Date();
  const minExpiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const maxExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let expiresAt: Date;
  if (!data.expiresAt) {
    expiresAt = maxExpiry;
  } else {
    const parsed = new Date(data.expiresAt);
    if (parsed < minExpiry) {
      expiresAt = minExpiry;
    } else if (parsed > maxExpiry) {
      expiresAt = maxExpiry;
    } else {
      expiresAt = parsed;
    }
  }

  const code = data.code ? data.code.toUpperCase() : generateCouponCode();

  const existing = await Coupon.findOne({ code });
  if (existing) {
    throw new AppError("Coupon code already exists", 409);
  }

  return await Coupon.create({
    code,
    discountPercent: data.discountPercent,
    maxUses: data.maxUses ?? 1,
    expiresAt,
    active: true,
    note: data.note ?? "",
  });
}

export async function getAllCoupons(): Promise<ICoupon[]> {
  return await Coupon.find().sort({ createdAt: -1 });
}

export async function validateCoupon(
  code: string,
): Promise<{ valid: true; coupon: ICoupon } | { valid: false; message: string }> {
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

  if (!coupon) {
    return { valid: false, message: "Coupon not found" };
  }
  if (!coupon.active) {
    return { valid: false, message: "Coupon is no longer active" };
  }
  if (new Date() > coupon.expiresAt) {
    return { valid: false, message: "Coupon has expired" };
  }
  if (coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: "Coupon has reached its usage limit" };
  }

  return { valid: true, coupon };
}

export async function deactivateCoupon(id: string): Promise<ICoupon> {
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new AppError("Coupon not found", 404);
  }
  coupon.active = false;
  await coupon.save();
  return coupon;
}
