import { Router } from "express";
import express from "express";
import { stripeWebhookHandler } from "./payment.controller.js";

const router = Router();

// 👇 THE FIX: We force Express to leave this body as a raw Buffer, NOT parsed JSON!
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);

export default router;
