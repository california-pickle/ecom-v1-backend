import mongoose from "mongoose";
import { deleteFromCloudinary } from "../../lib/cludinary.js";
import { Product } from "./product.model.js";
import type { CreateProductDTO, UpdateProductDTO } from "./product.schema.js";
import { AppError } from "../../middleware/errorHandler.js";

// Helper to strip 'undefined' fields preventing Mongoose strict-type crashes
const cleanData = <T>(data: T): any => JSON.parse(JSON.stringify(data));

export async function getStorefrontProduct() {
  const product = await Product.findOne({ isActive: true, isDeleted: false });
  if (!product) throw new AppError("Storefront is currently in 'Coming Soon' mode (no active product).", 404);
  return product;
}

export async function getAllProducts() {
  return await Product.find({ isDeleted: false }).sort({ createdAt: -1 });
}

// NEW: Fetch only the soft-deleted products so the admin can restore them
export async function getArchivedProducts() {
  return await Product.find({ isDeleted: true }).sort({ createdAt: -1 });
}

export async function createProduct(data: CreateProductDTO) {
  const cleanedData = cleanData(data);

  if (cleanedData.isActive) {
    const allUpcoming = cleanedData.variants.every((v: any) => v.stockStatus === "UPCOMING");
    if (allUpcoming) throw new AppError("An active product cannot have only UPCOMING variants.", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (cleanedData.isActive === true) {
      await Product.updateMany({ isDeleted: false }, { isActive: false }, { session });
    }

    const createdProducts = await Product.create([cleanedData], { session });

    await session.commitTransaction();
    return createdProducts[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function updateProduct(id: string, data: UpdateProductDTO) {
  const cleanedData = cleanData(data);

  const oldProduct = await Product.findById(id);
  if (!oldProduct || oldProduct.isDeleted) throw new Error("NOT_FOUND");

  const isBecomingActive = cleanedData.isActive === true && !oldProduct.isActive;
  const isBecomingInactive = cleanedData.isActive === false && oldProduct.isActive;
  const remainsActive = (cleanedData.isActive === true || cleanedData.isActive === undefined) && oldProduct.isActive;

  if (isBecomingActive || remainsActive) {
    const variantsToCheck = cleanedData.variants || oldProduct.variants;
    const allUpcoming = variantsToCheck.every((v: any) => v.stockStatus === "UPCOMING");
    if (allUpcoming) throw new Error("ACTIVE_UPCOMING_CONFLICT");
  }

  if (isBecomingInactive) {
    throw new Error("CANNOT_DEACTIVATE_ACTIVE");
  }

  let imagesToDelete: string[] = [];

  if (cleanedData.variants) {
    const oldPublicIds = oldProduct.variants.map((v) => v.imagePublicId).filter(Boolean);
    const newPublicIds = cleanedData.variants.map((v: any) => v.imagePublicId).filter(Boolean);
    imagesToDelete = oldPublicIds.filter((oldId) => !newPublicIds.includes(oldId));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (isBecomingActive) {
      await Product.updateMany({ _id: { $ne: id }, isDeleted: false }, { isActive: false }, { session });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, cleanedData, { new: true, session });
    await session.commitTransaction();

    imagesToDelete.forEach((publicId) => {
      deleteFromCloudinary(publicId).catch(console.error);
    });

    return updatedProduct;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function deleteProduct(id: string) {
  const totalActiveProducts = await Product.countDocuments({ isDeleted: false });
  if (totalActiveProducts <= 1) throw new Error("CANNOT_DELETE_LAST");

  const product = await Product.findById(id);
  if (!product || product.isDeleted) throw new Error("NOT_FOUND");

  // This is your guard! It guarantees active products cannot be deleted.
  if (product.isActive) throw new Error("CANNOT_DELETE_ACTIVE");

  product.isDeleted = true;
  await product.save();

  return true;
}

// NEW: Logic to undo the soft delete
export async function restoreProduct(id: string) {
  const product = await Product.findById(id);

  if (!product) throw new Error("NOT_FOUND");
  if (!product.isDeleted) throw new Error("ALREADY_RESTORED");

  product.isDeleted = false;
  // Note: We do NOT make it active automatically, just restore it to the draft/inactive state
  await product.save();

  return product;
}
