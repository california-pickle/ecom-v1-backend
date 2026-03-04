import { Schema, model, Document, Types } from "mongoose";

export interface IVariant {
  _id?: Types.ObjectId;
  sizeLabel: string;
  subtitle?: string;
  price: number;
  imageUrl: string;
  stock: number;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" | "UPCOMING";
  badge?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  flavor?: string;
  description: string;
  performanceMetrics: string[];
  isActive: boolean;
  variants: IVariant[]; // Array of size options
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IVariant>({
  sizeLabel: { type: String, required: true },
  subtitle: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  stock: { type: Number, default: 0 },
  stockStatus: {
    type: String,
    enum: ["IN_STOCK", "OUT_OF_STOCK", "LOW_STOCK", "UPCOMING"],
    default: "UPCOMING",
  },
  badge: { type: String },
});

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    flavor: { type: String },
    description: { type: String, required: true },
    performanceMetrics: { type: [String], default: [] },
    isActive: { type: Boolean, default: false },
    variants: { type: [variantSchema], required: true }, // Embeds the variants
  },
  { timestamps: true },
);

export const Product = model<IProduct>("Product", productSchema);
