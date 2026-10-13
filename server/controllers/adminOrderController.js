// /server/controllers/adminOrderController.js
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import ProductVariant from "../models/ProductVariant.js";

// @desc    Get all orders (admin) with filters
// @route   GET /api/admin/orders
// @access  Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 20, 1);

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate("user", "name email clerkId")
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

// @desc    Get single order by ID (admin)
// @route   GET /api/admin/orders/:id
// @access  Admin
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email clerkId")
      .select("-__v");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, deliveryDate } = req.body;

    const allowedStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent updating delivered/cancelled/refunded orders unless it's a correction
    if (["delivered", "cancelled"].includes(order.status) && order.status !== status) {
      return res.status(400).json({
        message: `Order already ${order.status}. Status cannot be changed.`,
      });
    }

    // If cancelling an order that had stock deducted, restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        await ProductVariant.findByIdAndUpdate(
          item.productVariant,
          { $inc: { "stock.quantity": item.quantity } }
        );
      }
    }

    if (deliveryDate) {
      order.deliveryDate = new Date(deliveryDate);
    }

    order.status = status;
    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status} by admin`,
    });

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark COD order as paid
// @route   PUT /api/admin/orders/:id/mark-paid
// @access  Admin
export const markOrderPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentMethod !== "cod") {
      return res.status(400).json({ message: "Only COD orders can be marked as paid" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order is already marked as paid" });
    }

    order.paymentStatus = "paid";
    order.statusHistory.push({
      status: order.status,
      note: "COD payment received",
    });

    await order.save();

    // Optionally create a Payment record if you want to track COD payments
    await Payment.create({
      order: order._id,
      user: order.user,
      amount: order.pricing.total,
      currency: "INR",
      method: "cod",
      status: "completed",
      paymentDate: new Date(),
    });

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an order (hard delete, only delivered/cancelled)
// @route   DELETE /api/admin/orders/:id
// @access  Admin
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        message: "Only delivered or cancelled orders can be deleted",
      });
    }

    // Delete associated payment record if any
    await Payment.deleteOne({ order: order._id });

    await order.deleteOne();

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};