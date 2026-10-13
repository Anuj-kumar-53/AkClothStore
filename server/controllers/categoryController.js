// /server/controllers/categoryController.js

import Category from "../models/Category.js";
import {
  uploadMultipleImages,
  deleteImage,
} from "../services/cloudinaryService.js";

// @desc    Create a new category
// @route   POST /api/categories
// @access  Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, parent, isActive } = req.body;

    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    let imageData = {
      url: "",
      publicId: "",
    };

    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadMultipleImages(
        [req.files[0]],
        "categories"
      );

      if (uploadedImages.length > 0) {
        imageData = {
          url: uploadedImages[0].url,
          publicId: uploadedImages[0].publicId,
        };
      }
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parent: parent || null,
      isActive: isActive !== undefined ? isActive : true,
      image: imageData,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate("parent", "name slug")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
    }).populate("parent", "name slug");

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
export const updateCategory = async (req, res, next) => {
  try {
    const { name, slug, description, parent, isActive } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Check slug uniqueness
    if (slug && slug !== category.slug) {
      const slugExists = await Category.findOne({ slug });

      if (slugExists) {
        return res.status(400).json({
          message: "Slug already exists",
        });
      }
    }

    // Update image only if a new image is provided
    if (req.files && req.files.length > 0) {
      // Delete old image from Cloudinary
      if (category.image?.publicId) {
        await deleteImage(category.image.publicId);
      }

      // Upload new image
      const uploadedImages = await uploadMultipleImages(
        [req.files[0]],
        "categories"
      );

      if (uploadedImages.length > 0) {
        category.image = {
          url: uploadedImages[0].url,
          publicId: uploadedImages[0].publicId,
        };
      }
    }

    // Update fields only when provided
    if (name !== undefined) {
      category.name = name;
    }

    if (slug !== undefined) {
      category.slug = slug;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (parent !== undefined) {
      category.parent = parent;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Delete image from Cloudinary
    if (category.image?.publicId) {
      await deleteImage(category.image.publicId);
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

