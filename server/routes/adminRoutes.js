// /server/routes/adminRoutes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  markOrderPaid,
  deleteOrder,
} from "../controllers/adminOrderController.js";
import {
  getStats,
  getUsers,
  toggleUserBlock,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireAdmin);

// Stats
router.get("/stats", getStats);

// User management
router.get("/users", getUsers);
router.put("/users/:id/block", toggleUserBlock);

// Order management
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/status", updateOrderStatus);
router.put("/orders/:id/mark-paid", markOrderPaid);
router.delete("/orders/:id", deleteOrder);

export default router;