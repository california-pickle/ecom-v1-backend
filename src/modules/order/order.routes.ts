import { Router } from "express";
import { createOrderHandler, getAllOrdersHandler } from "./order.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js"; // Adjust path if needed

const router = Router();

// ==========================================
// Public Routes (Storefront Checkout)
// ==========================================
router.post("/checkout", createOrderHandler);

// ==========================================
// Admin Routes (Dashboard)
// ==========================================
router.get("/admin/all", requireAuth, getAllOrdersHandler);

export default router;
