import { Schema, model, Document, Types } from "mongoose"; // 👈 FIX: Import Types

export interface IOrderItem {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  name: string;
  sizeLabel: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface IOrder extends Document {
  userId?: Types.ObjectId | null;
  email: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    aptOrSuite?: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  stripeSessionId?: string | null;
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variantId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  sizeLabel: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    email: { type: String, required: true, lowercase: true, trim: true },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      street: { type: String, required: true },
      aptOrSuite: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true, uppercase: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    stripeSessionId: { type: String, default: null },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
  },
  { timestamps: true },
);

export const Order = model<IOrder>("Order", orderSchema);
