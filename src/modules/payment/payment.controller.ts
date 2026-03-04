import type { Request, Response } from "express";
import * as PaymentService from "./payment.service.js";

export async function stripeWebhookHandler(req: Request, res: Response) {
  // 1. Grab the cryptographic signature Stripe sent us
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).send("Missing Stripe signature");
  }

  try {
    // 2. Pass the RAW body and the signature to our service
    // (req.body will be a raw Buffer here because of our router setup in the next step)
    await PaymentService.handleStripeWebhook(signature as string, req.body);

    // 3. Tell Stripe we got it successfully so they stop pinging us!
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("🚨 Stripe Webhook Error:", error.message);
    // Return a 400 so Stripe knows something went wrong
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
