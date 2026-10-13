// /server/controllers/brandController.js
import Brand from "../models/Brand.js";
import { uploadImage, deleteImage } from "../services/cloudinaryService.js";

// @desc    Create a new brand
// @route   POST /api/brands
// @access  Admin
export const createBrand = async (req, res, next) => {
  try {
    const { name, slug, description, website, featured, isActive } = req.body;

    const brandExists = await Brand.findOne({ slug });

    if (brandExists) {
      return res.status(400).json({
        message: "Brand already exists",
      });
    }

    let logoData = {
      url: "",
      publicId: "",
    };

    if (req.file) {
      const uploaded = await uploadImage(req.file, "brands");
      logoData = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    const brand = await Brand.create({
      name,
      slug,
      description,
      website,
      featured: featured !== undefined ? featured : false,
      isActive: isActive !== undefined ? isActive : true,
      logo: logoData,
    });

    res.status(201).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single brand by slug
// @route   GET /api/brands/:slug
// @access  Public
export const getBrandBySlug = async (req, res, next) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug });

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    res.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Admin
export const updateBrand = async (req, res, next) => {
  try {
    const { name, slug, description, website, featured, isActive } = req.body;

    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    if (slug && slug !== brand.slug) {
      const slugExists = await Brand.findOne({ slug });

      if (slugExists) {
        return res.status(400).json({
          message: "Slug already exists",
        });
      }
    }

    if (req.file) {
      if (brand.logo?.publicId) {
        await deleteImage(brand.logo.publicId);
      }

      const uploaded = await uploadImage(req.file, "brands");
      brand.logo = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    if (name !== undefined) {
      brand.name = name;
    }

    if (slug !== undefined) {
      brand.slug = slug;
    }

    if (description !== undefined) {
      brand.description = description;
    }

    if (website !== undefined) {
      brand.website = website;
    }

    if (featured !== undefined) {
      brand.featured = featured;
    }

    if (isActive !== undefined) {
      brand.isActive = isActive;
    }

    await brand.save();

    res.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Admin
export const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    if (brand.logo?.publicId) {
      await deleteImage(brand.logo.publicId);
    }

    await brand.deleteOne();

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};