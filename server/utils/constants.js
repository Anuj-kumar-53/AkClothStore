// /server/utils/constants.js

// Order statuses
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

// Payment statuses
export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

// Payment methods
export const PAYMENT_METHODS = ["cod", "razorpay"];

// Address types
export const ADDRESS_TYPES = ["home", "work", "other"];

// User roles
export const USER_ROLES = ["customer", "admin"];

// Product variant image views (optional)
export const IMAGE_VIEWS = [
  "front",
  "back",
  "left",
  "right",
  "top",
  "bottom",
  "detail",
  "other",
];

// Default pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;