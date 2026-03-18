import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  createCouponHandler,
  getAllCouponsHandler,
  validateCouponHandler,
  deactivateCouponHandler,
} from "./coupon.controller.js";

const router = Router();

// Public — called from checkout form
router.post("/validate", validateCouponHandler);

// Admin only
router.get("/", requireAuth, getAllCouponsHandler);
router.post("/", requireAuth, createCouponHandler);
router.put("/:id/deactivate", requireAuth, deactivateCouponHandler);

export default router;
