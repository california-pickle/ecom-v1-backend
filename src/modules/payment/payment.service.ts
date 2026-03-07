import Stripe from "stripe";
import { env } from "../../config/env.js";
import { Order } from "../order/order.model.js";
import { Product } from "../product/product.model.js"; // 👈 ADDED: We need this to deduct stock!
import { emailQueue } from "../../config/queue.js"; // 👈 Your BullMQ Queue
import { getOrderReceiptTemplate } from "../../templates/order.template.js";

// 1. Initialize Stripe (Bypassing the strict literal type check with 'as any')
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16" as any,
});

// 2. Generate the Secure Checkout Page
export async function createCheckoutSession(order: any) {
  // Map our database items into the exact format Stripe requires
  const lineItems = order.items.map((item: any) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.name} - ${item.sizeLabel}`,
        },
        // Stripe expects amounts in CENTS (so $22.00 is 2200)
        unit_amount: Math.round(item.priceAtPurchase * 100),
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.email,
    line_items: lineItems,

    // We attach the DB Order ID here so when Stripe pings us later, we know EXACTLY which order was paid for
    client_reference_id: order._id.toString(),

    // Where Stripe sends them after they pay
    // Note: I added '/api' so it correctly hits the GET route we built earlier for your testing!
    success_url: `http://localhost:${env.PORT}/api/order/session/{CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:${env.PORT}/api/order/session/{CHECKOUT_SESSION_ID}`,

    // We strictly enforce US shipping
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
  });

  // Save the Stripe Session ID to our database order so we have a record of it
  order.stripeSessionId = session.id;
  await order.save();

  return session.url; // This is the magical link we send to the frontend!
}

// 3. The Webhook Handler (When Stripe says "Give them the goods!")
export async function handleStripeWebhook(signature: string, rawBody: Buffer) {
  let event: Stripe.Event;

  try {
    // This verifies that the ping ACTUALLY came from Stripe and not a hacker
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    throw new Error(`Webhook Verification Failed: ${err.message}`);
  }

  // If the payment was completely successful
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.client_reference_id;

    if (orderId) {
      const order = await Order.findById(orderId);

      // We only process if the order exists and is still "pending"
      if (order && order.paymentStatus === "pending") {
        // 1. Mark as Paid and save the Payment Intent ID (for future refunds)
        order.paymentStatus = "paid";
        order.stripePaymentIntentId = session.payment_intent as string;
        await order.save();

        // 2. SAFELY DEDUCT THE INVENTORY NOW!
        for (const item of order.items) {
          // This goes into the Product collection and subtracts the exact amount bought
          await Product.updateOne(
            { _id: item.productId, "variants._id": item.variantId },
            { $inc: { "variants.$.stock": -item.quantity } },
          );
        }

        console.log(`✅ Order ${orderId} Paid & Stock Deducted Successfully!`);

        // 3. 🚨 ASYNC BACKGROUND EMAIL TRIGGER 🚨
        const htmlContent = getOrderReceiptTemplate(
          order.shippingAddress.firstName,
          order._id.toString(),
          order.totalAmount,
          order.items,
          order.shippingAddress,
        );

        // Toss it into the Redis Queue. Takes 1ms!
        await emailQueue.add("send-order-receipt", {
          type: "ORDER_CONFIRMATION",
          to: order.email,
          subject: "Order Confirmed - The California Pickle 🥒",
          html: htmlContent,
        });

        console.log(`✉️ Added Order Confirmation to Redis queue for ${order.email}`);
      } else {
        console.error(`🚨 Webhook received for Order ${orderId}, but it's not pending or doesn't exist!`);
      }
    }
  } else {
    // Just logs other events (like payment failed, etc) so you can see them in your terminal
    console.log(`ℹ️ Unhandled Stripe Event: ${event.type}`);
  }

  // Instantly respond 200 OK so Stripe knows we successfully caught the webhook
  return { received: true };
}
