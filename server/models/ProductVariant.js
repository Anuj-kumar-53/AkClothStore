// /server/models/ProductVariant.js
import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    productFamily: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductFamily',
      required: [true, 'Product family is required'],
    },

    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'SKU cannot exceed 100 characters'],
    },

    name: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true,
      maxlength: [200, 'Variant name cannot exceed 200 characters'],
    },

    attributes: {
      color: {
        type: String,
        trim: true,
        default: '',
      },
      size: {
        type: String,
        trim: true,
        default: '',
      },
      material: {
        type: String,
        trim: true,
        default: '',
      },
      weight: {
        type: String,
        trim: true,
        default: '',
      },
      dimensions: {
        length: { type: Number, default: null },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
      },
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        altText: {
          type: String,
          default: '',
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    price: {
      mrp: {
        type: Number,
        required: [true, 'MRP is required'],
        min: [0, 'MRP cannot be negative'],
      },
      sellingPrice: {
        type: Number,
        required: [true, 'Selling price is required'],
        min: [0, 'Selling price cannot be negative'],
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%'],
      },
    },

    stock: {
      quantity: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Stock cannot be negative'],
      },
      lowStockThreshold: {
        type: Number,
        default: 5,
        min: [0, 'Threshold cannot be negative'],
      },
      isInStock: {
        type: Boolean,
        default: true,
      },
    },

    sizeChart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SizeChart',
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productVariantSchema.index({ productFamily: 1 });
productVariantSchema.index({ 'attributes.color': 1 });
productVariantSchema.index({ 'attributes.size': 1 });
productVariantSchema.index({ 'price.sellingPrice': 1 });
productVariantSchema.index({ productFamily: 1, 'attributes.color': 1, 'attributes.size': 1 });

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);

export default ProductVariant;