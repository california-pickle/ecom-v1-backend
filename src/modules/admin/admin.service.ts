import { Admin } from "./admin.model.js";

export async function getAdminById(adminId: string) {
  const admin = await Admin.findById(adminId).select("-password -resetPasswordToken");
  if (!admin) throw new Error("Admin not found");
  return admin;
}
