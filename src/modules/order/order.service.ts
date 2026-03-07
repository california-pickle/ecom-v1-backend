import { Product } from "../product/product.model.js";
import { Order } from "./order.model.js";
import type { CreateOrderDTO } from "./order.schema.js";
import { AppError } from "../../middleware/errorHandler.js";

// Helper to deeply strip 'undefined' values to satisfy strict TypeScript
const cleanData = <T>(data: T): any => JSON.parse(JSON.stringify(data));

export async function createPendingOrder(data: CreateOrderDTO) {
  let calculatedTotal = 0;
  const processedItems = [];

  for (const item of data.items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive || product.isDeleted) {
      throw new AppError(`Product ${item.productId} is unavailable`, 400);
    }

    const variant = product.variants.find((v) => v._id?.toString() === item.variantId);
    if (!variant) {
      throw new AppError(`Variant not found for product ${product.name}`, 404);
    }

    // 👇 SAFE INVENTORY CHECK: Prevent sending them to Stripe if we are out of stock.
    // Notice we do NOT subtract the stock here!
    if (variant.stock < item.quantity) {
      throw new AppError(
        `Not enough stock for ${product.name} (${variant.sizeLabel}). Only ${variant.stock} left.`,
        400,
      );
    }

    processedItems.push({
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      sizeLabel: variant.sizeLabel,
      quantity: item.quantity,
      priceAtPurchase: variant.price,
    });

    calculatedTotal += variant.price * item.quantity;
  }

  const rawOrderData = {
    email: data.email,
    shippingAddress: data.shippingAddress,
    items: processedItems,
    totalAmount: calculatedTotal,
    paymentStatus: "pending",
  };

  // Create and return the pending order instantly
  return await Order.create(cleanData(rawOrderData));
}

export async function getAllOrders(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(),
  ]);

  return {
    data: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getOrderBySessionId(sessionId: string) {
  const order = await Order.findOne({ stripeSessionId: sessionId });
  if (!order) throw new AppError("Order not found", 404);
  return order;
}

export async function updateOrderStatus(id: string, status: "processing" | "shipped" | "delivered" | "cancelled") {
  const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
  if (!order) throw new AppError("Order not found", 404);
  return order;
}
