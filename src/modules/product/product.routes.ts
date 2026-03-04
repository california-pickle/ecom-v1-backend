import { Router } from "express";
import {
  getAllProductsHandler,
  createProductHandler,
  updateProductHandler,
  getStorefrontProductHandler,
} from "./product.controller.js";

import { requireAuth } from "../../middleware/requireAuth.js";

const router = Router();

// ==========================================
// Public Routes (Storefront)
// ==========================================
router.get("/storefront", getStorefrontProductHandler);
// ==========================================
// Admin Routes (Dashboard)
// ==========================================
router.get("/admin/all", requireAuth, getAllProductsHandler);
router.post("/", requireAuth, createProductHandler);
router.put("/:id", requireAuth, updateProductHandler);

export default router;
