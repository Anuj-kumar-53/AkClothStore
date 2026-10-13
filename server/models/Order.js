// /server/models/Order.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
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

    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
    },

    attributes: {
      color: { type: String, default: '' },
      size: { type: String, default: '' },
    },

    image: {
      type: String,
      default: '',
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },

    price: {
      mrp: {
        type: Number,
        required: true,
        min: [0, 'MRP cannot be negative'],
      },
      sellingPrice: {
        type: Number,
        required: true,
        min: [0, 'Selling price cannot be negative'],
      },
      discount: {
        type: Number,
        default: 0,
      },
    },

    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
  },
  {
    _id: true,
  }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    _id: true,
  }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    items: [orderItemSchema],

    shippingAddress: shippingAddressSchema,

    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative'],
      },
      shippingCharges: {
        type: Number,
        default: 0,
        min: [0, 'Shipping charges cannot be negative'],
      },
      tax: {
        type: Number,
        default: 0,
        min: [0, 'Tax cannot be negative'],
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
      },
      total: {
        type: Number,
        required: true,
        min: [0, 'Total cannot be negative'],
      },
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },

    statusHistory: [statusHistorySchema],

    paymentMethod: {
      type: String,
      enum: ['cod', 'razorpay'],
      required: [true, 'Payment method is required'],
    },

    razorpayOrderId: {
      type: String,
      trim: true,
      default: '',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    trackingNumber: {
      type: String,
      trim: true,
      default: '',
    },

    deliveryDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;