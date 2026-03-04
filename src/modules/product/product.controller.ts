import type { Request, Response } from "express";
import * as ProductService from "./product.service.js";
import { createProductSchema, updateProductSchema, productIdParamSchema } from "./product.schema.js";

export async function getStorefrontProductHandler(req: Request, res: Response) {
  try {
    const product = await ProductService.getStorefrontProduct();
    return res.status(200).json(product);
  } catch (error: any) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "No active product found for the storefront" });
    }
    return res.status(500).json({ message: "Failed to fetch storefront product" });
  }
}

export async function getAllProductsHandler(req: Request, res: Response) {
  try {
    const products = await ProductService.getAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin products" });
  }
}

export async function createProductHandler(req: Request, res: Response) {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    const product = await ProductService.createProduct(parsed.data);
    return res.status(201).json({ message: "Product created successfully", product });
  } catch (error: any) {
    // 11000 is MongoDB's native Duplicate Key Error code
    if (error.code === 11000) {
      return res.status(409).json({ message: "A product with this slug already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProductHandler(req: Request, res: Response) {
  try {
    const paramsParsed = productIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) return res.status(400).json({ errors: paramsParsed.error.issues });

    const id = paramsParsed.data.id;

    const bodyParsed = updateProductSchema.safeParse(req.body);
    if (!bodyParsed.success) return res.status(400).json({ errors: bodyParsed.error.issues });

    const updatedProduct = await ProductService.updateProduct(id, bodyParsed.data);
    return res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A product with this slug already exists" });
    }
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Product not found" });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
