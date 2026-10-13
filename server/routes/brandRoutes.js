// /server/routes/brandRoutes.js
import express from "express";
import {
  createBrand,
  getBrands,
  getBrandBySlug,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getBrands);
router.get("/:slug", getBrandBySlug);

// Admin routes
router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.single("logo"), // controller expects req.file
  createBrand
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.single("logo"),
  updateBrand
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteBrand
);

export default router;