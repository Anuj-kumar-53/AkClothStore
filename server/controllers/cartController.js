// /server/controllers/cartController.js

import Cart from "../models/Cart.js";
import ProductVariant from "../models/ProductVariant.js";

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.productVariant",
      select: "name sku attributes price stock images",
      populate: {
        path: "productFamily",
        select: "name slug images",
      },
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        discountAmount: 0,
        finalPrice: 0,
      });
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addItemToCart = async (req, res, next) => {
  try {
    const { productVariantId, quantity = 1 } = req.body;

    if (!productVariantId) {
      return res.status(400).json({
        message: "Product variant is required",
      });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({
        message: "Quantity must be between 1 and 10",
      });
    }

    const variant = await ProductVariant.findById(productVariantId).populate(
      "productFamily",
      "name slug images isActive"
    );

    if (!variant) {
      return res.status(404).json({
        message: "Product variant not found",
      });
    }

    if (!variant.isActive || !variant.productFamily?.isActive) {
      return res.status(400).json({
        message: "Product is not available",
      });
    }

    if (variant.stock.quantity < quantity) {
      return res.status(400).json({
        message: `Only ${variant.stock.quantity} items available in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        discountAmount: 0,
        finalPrice: 0,
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productVariant.toString() === productVariantId
    );

    if (existingItemIndex > -1) {
      const existingItem = cart.items[existingItemIndex];

      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > 10) {
        return res.status(400).json({
          message: "Maximum 10 items allowed per product",
        });
      }

      if (newQuantity > variant.stock.quantity) {
        return res.status(400).json({
          message: `Only ${variant.stock.quantity} items available in stock`,
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.priceAtAdd = variant.price.sellingPrice;
    } else {
      cart.items.push({
        productVariant: variant._id,
        productFamily: variant.productFamily._id,
        quantity,
        priceAtAdd: variant.price.sellingPrice,
      });
    }

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;

    for (const item of cart.items) {
      totalItems += item.quantity;
      totalPrice += item.priceAtAdd * item.quantity;
    }

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.finalPrice = Math.max(0, totalPrice - cart.discountAmount);

    await cart.save();

    await cart.populate({
      path: "items.productVariant",
      select: "name sku attributes price stock images",
      populate: {
        path: "productFamily",
        select: "name slug images",
      },
    });

    res.status(201).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({
        message: "Quantity must be between 1 and 10",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    const variant = await ProductVariant.findById(
      cart.items[itemIndex].productVariant
    );

    if (!variant) {
      return res.status(404).json({
        message: "Product variant not found",
      });
    }

    if (!variant.isActive) {
      return res.status(400).json({
        message: "Product is no longer available",
      });
    }

    if (quantity > variant.stock.quantity) {
      return res.status(400).json({
        message: `Only ${variant.stock.quantity} items available in stock`,
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].priceAtAdd = variant.price.sellingPrice;

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;

    for (const item of cart.items) {
      totalItems += item.quantity;
      totalPrice += item.priceAtAdd * item.quantity;
    }

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.finalPrice = Math.max(0, totalPrice - cart.discountAmount);

    await cart.save();

    await cart.populate({
      path: "items.productVariant",
      select: "name sku attributes price stock images",
      populate: {
        path: "productFamily",
        select: "name slug images",
      },
    });

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;

    for (const item of cart.items) {
      totalItems += item.quantity;
      totalPrice += item.priceAtAdd * item.quantity;
    }

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    cart.finalPrice = Math.max(0, totalPrice - cart.discountAmount);

    await cart.save();

    await cart.populate({
      path: "items.productVariant",
      select: "name sku attributes price stock images",
      populate: {
        path: "productFamily",
        select: "name slug images",
      },
    });

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.discountAmount = 0;
    cart.finalPrice = 0;
    cart.couponCode = "";

    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
export const applyCoupon = async (req, res, next) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        message: "Coupon code is required",
      });
    }

    // TODO: Implement coupon validation with Coupon model
    return res.status(400).json({
      message: "Coupon functionality is not implemented yet",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
export const removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.couponCode = "";
    cart.discountAmount = 0;
    cart.finalPrice = cart.totalPrice;

    await cart.save();

    res.json({
      success: true,
      message: "Coupon removed successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};