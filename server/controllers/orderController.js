// /server/controllers/orderController.js

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import ProductVariant from "../models/ProductVariant.js";
import { calculateDeliveryInfo } from "../services/distanceService.js";
import { createOrder as createRazorpayOrder } from "../services/razorpayService.js";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod, notes } = req.body;

    // Validate address
    if (!addressId) {
      return res.status(400).json({
        message: "Address is required",
      });
    }

    // Validate payment method
    if (!paymentMethod || !["cod", "razorpay"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Valid payment method is required",
      });
    }

    // Get cart
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.productVariant",
      select: "name sku attributes price stock images isActive",
      populate: {
        path: "productFamily",
        select: "name slug images isActive",
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // Get address
    const address = await Address.findOne({
      _id: addressId,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    // Check delivery availability
    const deliveryInfo = calculateDeliveryInfo(address.location);

    if (!deliveryInfo.deliverable) {
      return res.status(400).json({
        message: "Delivery not available for this location",
      });
    }

    // Recalculate subtotal from cart items
    let subtotal = 0;

    for (const item of cart.items) {
      const variant = item.productVariant;

      if (!variant) {
        return res.status(400).json({
          message: "One or more products in cart are no longer available",
        });
      }

      // Check product family
      if (!variant.productFamily || !variant.productFamily.isActive) {
        return res.status(400).json({
          message: `${variant.name} is no longer available`,
        });
      }

      // Check variant
      if (!variant.isActive) {
        return res.status(400).json({
          message: `${variant.name} is no longer available`,
        });
      }

      // Check stock
      if (variant.stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `Only ${variant.stock.quantity} units available for ${variant.name}`,
        });
      }

      subtotal += item.priceAtAdd * item.quantity;
    }

    // Calculate discount
    const discount = Math.min(
      Math.max(cart.discountAmount || 0, 0),
      subtotal
    );

    // Calculate shipping
    const shippingCharges = deliveryInfo.deliveryCharge;

    // Calculate GST
    const tax = Math.round((subtotal - discount) * 0.05);

    // Calculate final total
    const total = Math.max(
      0,
      subtotal + shippingCharges + tax - discount
    );

    if (total <= 0) {
      return res.status(400).json({
        message: "Invalid order total",
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      productVariant: item.productVariant._id,
      productFamily: item.productFamily,
      name: item.productVariant.name,
      sku: item.productVariant.sku,
      attributes: item.productVariant.attributes,
      image: item.productVariant.images?.[0]?.url || "",
      quantity: item.quantity,

      price: {
        mrp: item.productVariant.price.mrp,
        sellingPrice: item.priceAtAdd,
        discount: item.productVariant.price.discount,
      },

      totalPrice: item.priceAtAdd * item.quantity,
    }));

    // Shipping address snapshot
    const shippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark,
      location: address.location,
    };

    // Create order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,

      items: orderItems,

      shippingAddress,

      pricing: {
        subtotal,
        shippingCharges,
        tax,
        discount,
        total,
      },

      status: "pending",

      statusHistory: [
        {
          status: "pending",
          note: "Order placed",
        },
      ],

      paymentMethod,
      paymentStatus: "pending",

      notes: notes || "",
    });

    let razorpayOrder = null;

    // Create Razorpay order
    // if (paymentMethod === "razorpay") {
    //   try {
    //     razorpayOrder = await createRazorpayOrder(
    //       total,
    //       "INR",
    //       orderNumber
    //     );

    //     order.razorpayOrderId = razorpayOrder.orderId;
    //     await order.save();
    //   } catch (error) {
    //     // Delete order if Razorpay order creation fails
    //     await order.deleteOne();

    //     return res.status(500).json({
    //       message: "Unable to create Razorpay payment order",
    //     });
    //   }
    // }

    // Deduct stock
    for (const item of cart.items) {
      const updatedVariant = await ProductVariant.findOneAndUpdate(
        {
          _id: item.productVariant._id,
          "stock.quantity": { $gte: item.quantity },
        },
        {
          $inc: {
            "stock.quantity": -item.quantity,
          },
        },
        {
          new: true,
        }
      );

      if (!updatedVariant) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.productVariant.name}`,
        });
      }

      // Update stock availability
      updatedVariant.stock.isInStock =
        updatedVariant.stock.quantity > 0;

      await updatedVariant.save();
    }

    // Clear cart
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.discountAmount = 0;
    cart.finalPrice = 0;
    cart.couponCode = "";

    await cart.save();

    res.status(201).json({
      success: true,
      data: {
        order,
        razorpayOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      user: req.user._id,
    };

    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 10, 1);

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select("-__v");

    res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).select("-__v");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only pending/confirmed orders can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled in ${order.status} status`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      const variant = await ProductVariant.findById(
        item.productVariant
      );

      if (variant) {
        variant.stock.quantity += item.quantity;
        variant.stock.isInStock = variant.stock.quantity > 0;

        await variant.save();
      }
    }

    // Update order status
    order.status = "cancelled";

    order.statusHistory.push({
      status: "cancelled",
      note: "Order cancelled by user",
    });

    // If Razorpay payment was already completed,
    // refund handling should be done separately.
    // if (order.paymentMethod === "razorpay") {
    //   // Keep payment status unchanged here.
    //   // Refund should be handled through Razorpay refund API.
    // }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};