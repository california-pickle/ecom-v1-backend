import { Router } from "express";
import {
  createOrderHandler,
  getAllOrdersHandler,
  getOrdersByEmailHandler,
  getOrderBySessionHandler,
  updateOrderStatusHandler,
  getUnpaidOrdersHandler,
  sendManualReminderHandler,
  resumeOrderHandler,
} from "./order.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const router = Router();

// ==========================================
// Public Routes (Storefront Checkout)
// ==========================================
router.post("/checkout", createOrderHandler);
router.get("/session/:sessionId", getOrderBySessionHandler);
router.get("/:id/resume", resumeOrderHandler);

// ==========================================
// Admin Routes (Dashboard)
// ==========================================
router.get("/all", requireAuth, getAllOrdersHandler);
router.get("/by-email", requireAuth, getOrdersByEmailHandler);
router.get("/unpaid", requireAuth, getUnpaidOrdersHandler);
router.post("/:id/remind", requireAuth, sendManualReminderHandler);
router.put("/:id/status", requireAuth, updateOrderStatusHandler);

export default router;
