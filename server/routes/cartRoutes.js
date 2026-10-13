// /server/routes/cartRoutes.js
import express from "express";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

router.get("/", getCart);
router.post("/items", addItemToCart);
router.put("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeCartItem);
router.delete("/", clearCart);

// Coupon routes
router.post("/coupon", applyCoupon);
router.delete("/coupon", removeCoupon);

export default router;