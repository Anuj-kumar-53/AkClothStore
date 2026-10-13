// /server/models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order is required'],
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    razorpayOrderId: {
      type: String,
      trim: true,
      default: '',
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
      default: '',
    },

    razorpaySignature: {
      type: String,
      trim: true,
      default: '',
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },

    method: {
      type: String,
      enum: ['cod', 'razorpay'],
      required: [true, 'Payment method is required'],
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    refundDetails: {
      refundId: {
        type: String,
        trim: true,
        default: '',
      },
      refundAmount: {
        type: Number,
        default: 0,
        min: [0, 'Refund amount cannot be negative'],
      },
      refundReason: {
        type: String,
        trim: true,
        default: '',
      },
      refundedAt: {
        type: Date,
        default: null,
      },
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;