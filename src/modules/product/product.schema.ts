import { z } from "zod";

const stockStatusEnum = z.enum(["IN_STOCK", "OUT_OF_STOCK", "LOW_STOCK", "UPCOMING"] as const, {
  message: "Status must be IN_STOCK, OUT_OF_STOCK, LOW_STOCK, or UPCOMING",
});

const variantSchema = z.object({
  sizeLabel: z.string().min(1, { message: "Size label is required (e.g., '60ML')" }),
  subtitle: z.string().optional(),
  price: z.number().positive({ message: "Price must be greater than zero" }),
  imageUrl: z.url({ message: "Must be a valid image URL" }),
  stock: z.number().int().nonnegative().default(0),
  stockStatus: stockStatusEnum.default("UPCOMING"),
  badge: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, { message: "Product name is required" }),
  slug: z
    .string()
    .min(2, { message: "Slug is required" })
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug can only contain letters, numbers, and hyphens",
    }),
  flavor: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  performanceMetrics: z.array(z.string()).default([]),
  isActive: z.boolean().default(false),
  variants: z.array(variantSchema).min(1, { message: "You must add at least one size variant" }),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string({ message: "Product ID must be a valid string" }),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
