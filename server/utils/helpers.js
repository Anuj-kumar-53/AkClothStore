// /server/utils/helpers.js

/**
 * Generate a URL-friendly slug from a string.
 * @param {string} text
 * @returns {string} slug
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
};

/**
 * Generate a unique order number.
 * Format: ORD-<timestamp>-<random>
 * @returns {string} order number
 */
export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

/**
 * Generate a SKU (Stock Keeping Unit) from product name and variant attributes.
 * @param {string} productName
 * @param {object} attributes - e.g., { color: 'Pink', size: 'UK 4' }
 * @returns {string} SKU
 */
export const generateSKU = (productName, attributes = {}) => {
  const namePart = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

  const attrPart = Object.values(attributes)
    .map((val) => String(val).toUpperCase().replace(/[^A-Z0-9]/g, ""))
    .join("-");

  return attrPart ? `${namePart}-${attrPart}` : namePart;
};

/**
 * Calculate discount percentage from MRP and selling price.
 * @param {number} mrp
 * @param {number} sellingPrice
 * @returns {number} discount percentage (0-100)
 */
export const calculateDiscountPercentage = (mrp, sellingPrice) => {
  if (mrp <= 0 || sellingPrice > mrp) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
};

/**
 * Parse a boolean from string/number.
 * @param {*} value
 * @returns {boolean}
 */
export const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  if (typeof value === "number") return value === 1;
  return false;
};

/**
 * Safely parse a JSON string, return default if invalid.
 * @param {string} jsonString
 * @param {*} defaultValue
 * @returns {*}
 */
export const parseJsonField = (jsonString, defaultValue = {}) => {
 if (jsonString && typeof jsonString === "object") {
  return jsonString;
}
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

/**
 * Pagination helper.
 * @param {number} page
 * @param {number} limit
 * @returns {{ skip: number, limit: number, page: number }}
 */
export const getPagination = (page = 1, limit = 10) => {
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.max(parseInt(limit) || 10, 1);
  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum,
    page: pageNum,
  };
};