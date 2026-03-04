import { Router } from "express";
import { getMeHandler } from "./admin.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const router = Router();

router.get("/me", requireAuth, getMeHandler);

export default router;
