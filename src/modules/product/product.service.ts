import { Product } from "./product.model.js";
import type { CreateProductDTO, UpdateProductDTO } from "./product.schema.js";

// Helper to deeply strip all 'undefined' values (from root and variants array) to keep TypeScript happy
const cleanData = (data: any) => JSON.parse(JSON.stringify(data));

// PUBLIC: Fetch a specific active product by its slug for the storefront
export async function getStorefrontProduct() {
  // Finds the first product where isActive is true
  const product = await Product.findOne({ isActive: true });
  if (!product) throw new Error("NOT_FOUND");
  return product;
}

// ADMIN: Fetch absolutely everything for the dashboard table
export async function getAllProducts() {
  return await Product.find().sort({ createdAt: -1 });
}

export async function createProduct(data: CreateProductDTO) {
  const cleanedData = cleanData(data);
  return await Product.create(cleanedData);
}

export async function updateProduct(id: string, data: UpdateProductDTO) {
  const cleanedData = cleanData(data);

  // Uses the official MongoDB driver syntax to return the newly updated document
  const product = await Product.findByIdAndUpdate(id, cleanedData, { returnDocument: "after" });
  if (!product) throw new Error("NOT_FOUND");

  return product;
}
