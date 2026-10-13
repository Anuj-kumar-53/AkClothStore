// /server/routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// Admin routes
router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.array("images", 5), // controller expects req.files (array)
  createCategory
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.array("images", 5),
  updateCategory
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteCategory
);

export default router;