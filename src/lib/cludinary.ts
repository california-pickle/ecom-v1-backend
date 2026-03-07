import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Helper: Upload image to Cloudinary & Delete local file
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = "california-pickle-products",
): Promise<{ url: string; publicId: string }> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      timeout: 60000,
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        /* ignore */
      }
    }

    if (error.http_code === 499 || error.name === "TimeoutError") {
      console.log("⚠️ NORMAL TIMEOUT: A heavy image upload was safely cancelled by the server.");
    } else {
      console.log(error);
      console.error("❌ REAL PROBLEM: Cloudinary upload failed:", error.message || error);
    }

    throw new Error("Image upload to cloud failed or took too long. Please try again.");
  }
};

// Helper: Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};
