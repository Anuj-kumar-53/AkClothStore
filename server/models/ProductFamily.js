// /server/models/ProductFamily.js
import mongoose from 'mongoose';

const productFamilySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product family name is required'],
      trim: true,
      maxlength: [200, 'Product family name cannot exceed 200 characters'],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand is required'],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
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

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (removed redundant slug index - unique: true already creates it)
productFamilySchema.index({ brand: 1 });
productFamilySchema.index({ category: 1 });
productFamilySchema.index({ brand: 1, category: 1 });
productFamilySchema.index({ isActive: 1, isFeatured: 1 });

const ProductFamily = mongoose.model('ProductFamily', productFamilySchema);

export default ProductFamily;