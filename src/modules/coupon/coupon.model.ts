import { Schema, model, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  active: boolean;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercent: { type: Number, required: true, min: 1, max: 50 },
    maxUses: { type: Number, required: true, min: 1, default: 1 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    active: { type: Boolean, default: true },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

// Fast lookup by code (used during checkout validation)
couponSchema.index({ code: 1 });
// Admin list — sorted by createdAt desc
couponSchema.index({ createdAt: -1 });

export const Coupon = model<ICoupon>("Coupon", couponSchema);
