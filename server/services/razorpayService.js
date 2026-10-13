// /server/services/razorpayService.js

import crypto from "crypto";
import razorpay from "../config/razorpay.js";


export const createOrder = async (amount, currency = "INR", receipt) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    throw new Error("Razorpay order creation failed: " + error.message);
  }
};

export const verifyPayment = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpaySignature;
};

export const getPaymentDetails = async (paymentId) => {
  try {
    return await razorpay.payments.fetch(paymentId);
  } catch (error) {
    throw new Error("Failed to fetch payment details: " + error.message);
  }
};

export const refundPayment = async (paymentId, amount) => {
  try {
    const options = amount
      ? { amount: Math.round(amount * 100) }
      : {};

    return await razorpay.payments.refund(paymentId, options);
  } catch (error) {
    throw new Error("Refund failed: " + error.message);
  }
};