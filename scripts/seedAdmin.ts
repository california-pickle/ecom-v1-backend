import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Admin } from "../src/modules/admin/admin.model.js"; // Adjust path as needed

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("📦 Connected to MongoDB");

    const adminEmail = "geminisubs10@gmail.com"; // CHANGE THIS
    const adminPassword = "hackerbolteNabilkachaddikholte"; // CHANGE THIS

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists. Exiting.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await Admin.create({
      email: adminEmail,
      password: hashedPassword,
    });

    console.log(`✅ Admin created successfully: ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedAdmin();
