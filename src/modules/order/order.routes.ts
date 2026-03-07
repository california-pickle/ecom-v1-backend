import { Router } from "express";
import {
  createOrderHandler,
  getAllOrdersHandler,
  getOrderBySessionHandler,
  updateOrderStatusHandler, // 👈 Import new handler
} from "./order.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const router = Router();

// ==========================================
// Public Routes (Storefront Checkout)
// ==========================================
router.post("/checkout", createOrderHandler);
router.get("/session/:sessionId", getOrderBySessionHandler);

// ==========================================
// Admin Routes (Dashboard)
// ==========================================
router.get("/admin/all", requireAuth, getAllOrdersHandler);

// 👇 NEW: Update status route for the dashboard
router.put("/admin/:id/status", requireAuth, updateOrderStatusHandler);

export default router;
