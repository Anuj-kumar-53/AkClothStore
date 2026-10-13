// /server/models/Cart.js
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productVariant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: [true, 'Product variant is required'],
    },

    productFamily: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductFamily',
      required: [true, 'Product family is required'],
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Quantity cannot exceed 10'],
    },

    priceAtAdd: {
      type: Number,
      required: [true, 'Price at add is required'],
      min: [0, 'Price cannot be negative'],
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
    },

    items: [cartItemSchema],

    totalItems: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Total price cannot be negative'],
    },

    couponCode: {
      type: String,
      trim: true,
      default: '',
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },

    finalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Final price cannot be negative'],
    },

    lastModifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// No indexes needed - user field already has unique: true

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;