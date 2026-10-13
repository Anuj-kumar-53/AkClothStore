// /server/controllers/paymentController.js

import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import {
  verifyPayment as verifyRazorpaySignature,
} from "../services/razorpayService.js";

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // Validate payment details
    if (
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return res.status(400).json({
        message: "All payment details are required",
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Check that the order belongs to the current user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Make sure this Razorpay order belongs to our order
    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({
        message: "Invalid Razorpay order ID",
      });
    }

    // Verify Razorpay signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // Check if payment was already verified
    let payment = await Payment.findOne({
      order: order._id,
    });

    if (payment && payment.status === "completed") {
      return res.json({
        success: true,
        message: "Payment already verified",
        data: {
          payment,
          order,
        },
      });
    }

    // Create payment record
    if (!payment) {
      payment = await Payment.create({
        order: order._id,
        user: order.user,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,

        // Amount is stored in INR
        amount: order.pricing.total,

        currency: "INR",
        method: "razorpay",
        status: "completed",
        paymentDate: new Date(),
      });
    } else {
      payment.razorpayOrderId = razorpayOrderId;
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.amount = order.pricing.total;
      payment.currency = "INR";
      payment.method = "razorpay";
      payment.status = "completed";
      payment.paymentDate = new Date();

      await payment.save();
    }

    // Mark order as paid
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.status = "confirmed";

      order.statusHistory.push({
        status: "confirmed",
        note: "Payment verified successfully",
      });

      await order.save();
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        payment,
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get payment details for an order
// @route   GET /api/payments/order/:orderId
// @access  Private
export const getPaymentByOrderId = async (req, res, next) => {
  try {
    // Find the order
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Make sure the order belongs to the logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    // Find payment for this order
    const payment = await Payment.findOne({
      order: order._id,
    }).select(
      "order razorpayOrderId razorpayPaymentId amount currency method status paymentDate createdAt"
    );

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// NOT REQUIRED RIGHT NOW
// ============================================================

// We are NOT implementing these features yet:
//
// 1. Refund
// 2. Partial refund
// 3. Customer refund request
// 4. Admin refund
// 5. Payment cancellation
// 6. Payment webhook
// 7. Payment history/admin payment dashboard
//
// We can add them later if the project requires them.