// /server/models/SizeChart.js
import mongoose from 'mongoose';

const sizeChartSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Size chart name is required'],
      trim: true,
      maxlength: [100, 'Size chart name cannot exceed 100 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
    },
    measurementUnit: {
      type: String,
      enum: ['inches', 'cm'],
      default: 'inches',
    },
    sizes: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },
        measurements: {
          chest: { type: Number, default: null },
          waist: { type: Number, default: null },
          hips: { type: Number, default: null },
          length: { type: Number, default: null },
          shoulder: { type: Number, default: null },
          sleeve: { type: Number, default: null },
          neck: { type: Number, default: null },
          inseam: { type: Number, default: null },
        },
        additionalInfo: {
          type: String,
          default: '',
        },
      },
    ],
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
sizeChartSchema.index({ category: 1, brand: 1 });
sizeChartSchema.index({ name: 1 });

const SizeChart = mongoose.model('SizeChart', sizeChartSchema);

export default SizeChart;
