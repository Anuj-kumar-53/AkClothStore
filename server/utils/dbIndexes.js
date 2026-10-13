// /server/utils/dbIndexes.js

/**
 * This file lists all custom indexes used in the models.
 * It's optional and can be used for documentation or to verify indexes.
 * Mongoose automatically creates indexes based on schema definitions,
 * so you don't need to call anything unless you want to see them.
 */

export const listIndexes = () => {
  return {
    Category: [
      { slug: 1 },
      { parent: 1 },
    ],
    Brand: [
      { slug: 1 },
      { name: 1 },
      { featured: 1 },
    ],
    SizeChart: [
      { category: 1, brand: 1 },
      { name: 1 },
    ],
    User: [
      { clerkId: 1 },
      { email: 1 },
      { role: 1 },
    ],
    Address: [
      { user: 1 },
      { user: 1, isDefault: 1 },
    ],
    ProductFamily: [
      { brand: 1 },
      { category: 1 },
      { brand: 1, category: 1 },
      { isActive: 1, isFeatured: 1 },
    ],
    ProductVariant: [
      { productFamily: 1 },
      { "attributes.color": 1 },
      { "attributes.size": 1 },
      { "price.sellingPrice": 1 },
      { productFamily: 1, "attributes.color": 1, "attributes.size": 1 },
    ],
    Cart: [
      // unique user index handled by unique: true on user field
    ],
    Order: [
      { user: 1 },
      { status: 1 },
      { paymentStatus: 1 },
      { user: 1, status: 1 },
      { createdAt: -1 },
    ],
    Payment: [
      { user: 1 },
      { status: 1 },
      { razorpayOrderId: 1 },
    ],
  };
};

// If you ever want to manually ensure all indexes are built:
// import mongoose from "mongoose";
// import Category from "../models/Category.js";
// ... import other models
// await Category.ensureIndexes();
// ... etc.