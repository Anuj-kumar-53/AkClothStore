// /server/routes/paymentRoutes.js
import express from "express";
import {
  verifyPayment,
  getPaymentByOrderId,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All payment routes require authentication
router.use(requireAuth);

// Verify payment after Razorpay checkout
router.post("/verify", verifyPayment);

// Get payment details for an order
router.get("/order/:orderId", getPaymentByOrderId);

export default router;