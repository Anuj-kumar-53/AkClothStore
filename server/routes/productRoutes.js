// /server/routes/productRoutes.js
import express from "express";
import {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/productController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// Admin routes

// Product Family routes
router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.array("images", 10), // product family images
  createProduct
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.array("images", 10),
  updateProduct
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteProduct
);

// Variant routes
router.post(
  "/:id/variants",
  requireAuth,
  requireAdmin,
  upload.array("images", 10), // variant images
  addVariant
);

router.put(
  "/variants/:id",
  requireAuth,
  requireAdmin,
  upload.array("images", 10),
  updateVariant
);

router.delete(
  "/variants/:id",
  requireAuth,
  requireAdmin,
  deleteVariant
);

export default router;