// /server/controllers/adminController.js
import Order from "../models/Order.js";
import User from "../models/User.js";
import ProductFamily from "../models/ProductFamily.js";
import ProductVariant from "../models/ProductVariant.js";

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
export const getStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const confirmedOrders = await Order.countDocuments({ status: "confirmed" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalProducts = await ProductFamily.countDocuments({ isActive: true });
    const totalVariants = await ProductVariant.countDocuments({ isActive: true });

    const lowStockVariants = await ProductVariant.countDocuments({
      "stock.quantity": { $lte: 5, $gt: 0 },
      isActive: true,
    });

    const outOfStockVariants = await ProductVariant.countDocuments({
      "stock.quantity": 0,
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        users: {
          total: totalUsers,
        },
        products: {
          total: totalProducts,
          variants: totalVariants,
          lowStock: lowStockVariants,
          outOfStock: outOfStockVariants,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) query.role = role;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { clerkId: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 20, 1);

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select("-__v");

    res.json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block / unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Admin
export const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot block admin users" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? "User unblocked" : "User blocked",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};