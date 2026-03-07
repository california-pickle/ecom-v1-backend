import type { Request, Response } from "express";
import * as OrderService from "./order.service.js";
import * as PaymentService from "../payment/payment.service.js";
import { createOrderSchema, orderIdParamSchema, updateOrderStatusSchema } from "./order.schema.js";
import { AppError } from "../../middleware/errorHandler.js";

export async function createOrderHandler(req: Request, res: Response) {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    // 1. Create the pending order in MongoDB
    const order = await OrderService.createPendingOrder(parsed.data);

    // 2. Generate the Stripe Checkout Link
    const checkoutUrl = await PaymentService.createCheckoutSession(order);

    return res.status(201).json({
      message: "Order initialized, redirecting to payment...",
      checkoutUrl,
      order,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Create Order Error:", error);
    return res.status(500).json({ message: "Failed to create order" });
  }
}

export async function getAllOrdersHandler(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await OrderService.getAllOrders(page, limit);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return res.status(500).json({ message: "Internal server error fetching orders" });
  }
}

export async function getOrderBySessionHandler(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: "Session ID is required" });

    const order = await OrderService.getOrderBySessionId(sessionId as string);

    // Data Masking for public receipt
    const safeOrder = {
      _id: order._id,
      items: order.items,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      customerFirstName: order.shippingAddress.firstName,
      shippingCity: order.shippingAddress.city,
      createdAt: order.createdAt,
    };

    return res.status(200).json(safeOrder);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Get Order by Session Error:", error);
    return res.status(500).json({ message: "Failed to fetch order details" });
  }
}

export async function updateOrderStatusHandler(req: Request, res: Response) {
  try {
    const paramsParsed = orderIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) return res.status(400).json({ errors: paramsParsed.error.issues });

    const bodyParsed = updateOrderStatusSchema.safeParse(req.body);
    if (!bodyParsed.success) return res.status(400).json({ errors: bodyParsed.error.issues });

    const updatedOrder = await OrderService.updateOrderStatus(paramsParsed.data.id, bodyParsed.data.orderStatus);

    return res.status(200).json({
      message: `Order marked as ${updatedOrder.orderStatus}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Update Order Status Error:", error);
    return res.status(500).json({ message: "Internal server error updating order" });
  }
}
