import type { Request, Response } from "express";
import * as AdminService from "./admin.service.js";

export async function getMeHandler(req: Request, res: Response) {
  try {
    const adminId = (req as any).user.id;
    const admin = await AdminService.getAdminById(adminId);
    return res.status(200).json({ admin });
  } catch (error: any) {
    return res.status(404).json({ message: "Admin profile not found" });
  }
}
