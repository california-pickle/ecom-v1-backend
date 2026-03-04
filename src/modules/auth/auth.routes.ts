import { Router } from "express";
import {
  loginHandler,
  refreshHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "./auth.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { authLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

router.post("/login", authLimiter, loginHandler);
router.post("/forgot-password", authLimiter, forgotPasswordHandler);

router.post("/reset-password", resetPasswordHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", requireAuth, logoutHandler);

export default router;
