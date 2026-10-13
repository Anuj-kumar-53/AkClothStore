import ProductFamily from "../models/ProductFamily.js";
import ProductVariant from "../models/ProductVariant.js";
import SizeChart from "../models/SizeChart.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import {
  uploadMultipleImages,
  deleteImage,
} from "../services/cloudinaryService.js";

/* =========================================================
   HELPERS
========================================================= */

const parseTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const parseBoolean = (value, defaultValue = true) => {
  if (value === undefined) return defaultValue;

  if (typeof value === "boolean") {
    return value;
  }

  return value === "true";
};

const formatImages = (uploadedImages) => {
  return uploadedImages.map((img, index) => ({
    url: img.url,
    publicId: img.publicId,
    altText: "",
    isPrimary: index === 0,
  }));
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSearchRegex = (term) => {
  const escaped = escapeRegex(term);
  const pattern = term.length <= 3 ? `\\b${escaped}\\b` : escaped;
  return { $regex: pattern, $options: "i" };
};

const collectIdsForTerm = async (term) => {
  const rx = buildSearchRegex(term);

  const [matchedCategories, matchedBrands, fieldMatches] = await Promise.all([
    Category.find({ name: rx }).select("_id"),
    Brand.find({ name: rx }).select("_id"),
    ProductFamily.find({
      isActive: true,
      $or: [{ name: rx }, { description: rx }, { tags: rx }],
    }).select("_id"),
  ]);

  const categoryIds = matchedCategories.map((category) => category._id);
  const brandIds = matchedBrands.map((brand) => brand._id);

  const refClauses = [];
  if (categoryIds.length) {
    refClauses.push({ category: { $in: categoryIds } });
  }
  if (brandIds.length) {
    refClauses.push({ brand: { $in: brandIds } });
  }

  const refMatches = refClauses.length
    ? await ProductFamily.find({
        isActive: true,
        $or: refClauses,
      }).select("_id")
    : [];

  const ids = new Set();
  for (const doc of fieldMatches) {
    ids.add(String(doc._id));
  }
  for (const doc of refMatches) {
    ids.add(String(doc._id));
  }
  return ids;
};

const collectMatchingProductIds = async (search) => {
  const terms = String(search)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (!terms.length) {
    return [];
  }

  const idSets = await Promise.all(terms.map((term) => collectIdsForTerm(term)));

  let intersection = idSets[0];
  for (const idSet of idSets.slice(1)) {
    intersection = new Set([...intersection].filter((id) => idSet.has(id)));
  }

  if (intersection.size > 0) {
    return [...intersection];
  }

  const union = new Set();
  for (const idSet of idSets) {
    for (const id of idSet) {
      union.add(id);
    }
  }
  return [...union];
};

const applyIdFilter = (query, ids) => {
  if (query._id?.$in) {
    const existing = new Set(query._id.$in.map(String));
    query._id = {
      $in: ids.filter((id) => existing.has(String(id))),
    };
    return;
  }

  query._id = { $in: ids };
};

/* =========================================================
   CREATE PRODUCT
   POST /api/products
   Admin
========================================================= */

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      brand,
      category,
      tags,
      isActive,
      isFeatured,
    } = req.body;

    /* -------------------------
       Validate required fields
    ------------------------- */

    if (!name || !slug || !brand || !category) {
      return res.status(400).json({
        message: "Name, slug, brand and category are required",
      });
    }

    /* -------------------------
       Check duplicate slug
    ------------------------- */

    const productExists = await ProductFamily.findOne({ slug });

    if (productExists) {
      return res.status(400).json({
        message: "Product with this slug already exists",
      });
    }

    /* -------------------------
       Upload product images
    ------------------------- */

    let imagesData = [];

    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadMultipleImages(
        req.files,
        "products"
      );

      imagesData = formatImages(uploadedImages);
    }

    /* -------------------------
       Parse data
    ------------------------- */

    const parsedTags = parseTags(tags);

    const activeValue = parseBoolean(isActive, true);

    const featuredValue = parseBoolean(isFeatured, false);

    /* -------------------------
       Create Product Family
    ------------------------- */

    const productFamily = await ProductFamily.create({
      name,
      slug,
      description: description || "",
      brand,
      category,
      tags: parsedTags,
      isActive: activeValue,
      isFeatured: featuredValue,
      images: imagesData,
    });

    res.status(201).json({
      success: true,
      data: productFamily,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET ALL PRODUCTS
   GET /api/products
   Public
========================================================= */

export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      color,
      size,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 10, 1);

    /* -------------------------
       Base query
    ------------------------- */

    const query = {
      isActive: true,
    };

    /* -------------------------
       Category filter
    ------------------------- */

    if (category) {
      query.category = category;
    }

    /* -------------------------
       Brand filter
    ------------------------- */

    if (brand) {
      query.brand = brand;
    }

    /* -------------------------
       Variant filters
    ------------------------- */

    if (minPrice || maxPrice || color || size) {
      const variantQuery = {
        isActive: true,
      };

      /* Price */

      if (minPrice || maxPrice) {
        variantQuery["price.sellingPrice"] = {};

        if (minPrice) {
          variantQuery["price.sellingPrice"].$gte = Number(minPrice);
        }

        if (maxPrice) {
          variantQuery["price.sellingPrice"].$lte = Number(maxPrice);
        }
      }

      /* Color */

      if (color) {
        variantQuery["attributes.color"] = color;
      }

      /* Size */

      if (size) {
        variantQuery["attributes.size"] = size;
      }

      const variantProductIds = await ProductVariant.distinct(
        "productFamily",
        variantQuery
      );

      query._id = {
        $in: variantProductIds,
      };
    }

    /* -------------------------
       Search
    ------------------------- */

    if (search && String(search).trim()) {
      const matchingIds = await collectMatchingProductIds(search);
      applyIdFilter(query, matchingIds);
    }

    /* -------------------------
       Count
    ------------------------- */

    const total = await ProductFamily.countDocuments(query);

    /* -------------------------
       Get products
    ------------------------- */

    const products = await ProductFamily.find(query)
      .populate("brand", "name slug logo")
      .populate("category", "name slug")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    /* -------------------------
       Get variants
    ------------------------- */

    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await ProductVariant.find({
          productFamily: product._id,
          isActive: true,
        })
          .populate("sizeChart", "name sizes measurementUnit")
          .select("-__v");

        return {
          ...product.toObject(),
          variants,
        };
      })
    );

    /* -------------------------
       Price sorting
    ------------------------- */

    if (sort === "price-low-to-high") {
      productsWithVariants.sort((a, b) => {
        const aPrices = a.variants.map(
          (variant) => variant.price?.sellingPrice
        );

        const bPrices = b.variants.map(
          (variant) => variant.price?.sellingPrice
        );

        const aPrice = aPrices.length
          ? Math.min(...aPrices)
          : Infinity;

        const bPrice = bPrices.length
          ? Math.min(...bPrices)
          : Infinity;

        return aPrice - bPrice;
      });
    }

    if (sort === "price-high-to-low") {
      productsWithVariants.sort((a, b) => {
        const aPrices = a.variants.map(
          (variant) => variant.price?.sellingPrice
        );

        const bPrices = b.variants.map(
          (variant) => variant.price?.sellingPrice
        );

        const aPrice = aPrices.length
          ? Math.max(...aPrices)
          : -Infinity;

        const bPrice = bPrices.length
          ? Math.max(...bPrices)
          : -Infinity;

        return bPrice - aPrice;
      });
    }

    /* -------------------------
       Response
    ------------------------- */

    res.json({
      success: true,
      count: productsWithVariants.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: productsWithVariants,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET PRODUCT BY SLUG
   GET /api/products/:slug
   Public
========================================================= */

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await ProductFamily.findOne({
      slug: req.params.slug,
      isActive: true,
    })
      .populate("brand", "name slug logo")
      .populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const variants = await ProductVariant.find({
      productFamily: product._id,
      isActive: true,
    })
      .populate("sizeChart", "name sizes measurementUnit")
      .select("-__v");

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        variants,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE PRODUCT
   PUT /api/products/:id
   Admin
========================================================= */

export const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      brand,
      category,
      tags,
      isActive,
      isFeatured,
    } = req.body;

    /* -------------------------
       Find product
    ------------------------- */

    const product = await ProductFamily.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /* -------------------------
       Check slug uniqueness
    ------------------------- */

    if (slug && slug !== product.slug) {
      const slugExists = await ProductFamily.findOne({
        slug,
        _id: { $ne: product._id },
      });

      if (slugExists) {
        return res.status(400).json({
          message: "Slug already exists",
        });
      }
    }

    /* -------------------------
       Replace product images
    ------------------------- */

    if (req.files && req.files.length > 0) {
      /*
        IMPORTANT:
        Upload new images FIRST.
        Only delete old images after
        successful upload.
      */

      const uploadedImages = await uploadMultipleImages(
        req.files,
        "products"
      );

      const newImages = formatImages(uploadedImages);

      /* Delete old Cloudinary images */

      for (const img of product.images || []) {
        if (img.publicId) {
          await deleteImage(img.publicId);
        }
      }

      product.images = newImages;
    }

    /* -------------------------
       Update fields
    ------------------------- */

    if (name !== undefined) {
      product.name = name;
    }

    if (slug !== undefined) {
      product.slug = slug;
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (brand !== undefined) {
      product.brand = brand;
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (tags !== undefined) {
      product.tags = parseTags(tags);
    }

    if (isActive !== undefined) {
      product.isActive = parseBoolean(isActive);
    }

    if (isFeatured !== undefined) {
      product.isFeatured = parseBoolean(isFeatured, false);
    }

    /* -------------------------
       Save
    ------------------------- */

    await product.save();

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE PRODUCT
   DELETE /api/products/:id
   Admin
========================================================= */

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await ProductFamily.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /* -------------------------
       Delete ProductFamily images
    ------------------------- */

    for (const img of product.images || []) {
      if (img.publicId) {
        await deleteImage(img.publicId);
      }
    }

    /* -------------------------
       Find variants
    ------------------------- */

    const variants = await ProductVariant.find({
      productFamily: product._id,
    });

    /* -------------------------
       Delete variant images
    ------------------------- */

    for (const variant of variants) {
      for (const img of variant.images || []) {
        if (img.publicId) {
          await deleteImage(img.publicId);
        }
      }
    }

    /* -------------------------
       Delete variants
    ------------------------- */

    await ProductVariant.deleteMany({
      productFamily: product._id,
    });

    /* -------------------------
       Delete product
    ------------------------- */

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   ADD VARIANT
   POST /api/products/:id/variants
   Admin
========================================================= */

export const addVariant = async (req, res, next) => {
  try {
    /* -------------------------
       Find product
    ------------------------- */

    const product = await ProductFamily.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      sku,
      name,
      attributes,
      price,
      stock,
      sizeChart,
      isActive,
    } = req.body;

    /* -------------------------
       Validate SKU
    ------------------------- */

    if (!sku) {
      return res.status(400).json({
        message: "SKU is required",
      });
    }

    const variantExists = await ProductVariant.findOne({
      sku,
    });

    if (variantExists) {
      return res.status(400).json({
        message: "Variant with this SKU already exists",
      });
    }

    /* -------------------------
       Parse variant data
    ------------------------- */

    const parsedAttributes =
      typeof attributes === "string"
        ? JSON.parse(attributes)
        : attributes;

    const parsedPrice =
      typeof price === "string"
        ? JSON.parse(price)
        : price;

    const parsedStock =
      typeof stock === "string"
        ? JSON.parse(stock)
        : stock;

    /* -------------------------
       Upload variant images
    ------------------------- */

    let imagesData = [];

    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadMultipleImages(
        req.files,
        "products/variants"
      );

      imagesData = formatImages(uploadedImages);
    }

    /* -------------------------
       Create variant
    ------------------------- */

    const variant = await ProductVariant.create({
      productFamily: product._id,
      sku,
      name,
      attributes: parsedAttributes,
      price: parsedPrice,
      stock: parsedStock,
      sizeChart: sizeChart || null,
      isActive: parseBoolean(isActive, true),
      images: imagesData,
    });

    res.status(201).json({
      success: true,
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   UPDATE VARIANT
   PUT /api/products/variants/:id
   Admin
========================================================= */

export const updateVariant = async (req, res, next) => {
  try {
    const {
      sku,
      name,
      attributes,
      price,
      stock,
      sizeChart,
      isActive,
    } = req.body;

    /* -------------------------
       Find variant
    ------------------------- */

    const variant = await ProductVariant.findById(req.params.id);

    if (!variant) {
      return res.status(404).json({
        message: "Variant not found",
      });
    }

    /* -------------------------
       Check SKU uniqueness
    ------------------------- */

    if (sku && sku !== variant.sku) {
      const skuExists = await ProductVariant.findOne({
        sku,
        _id: { $ne: variant._id },
      });

      if (skuExists) {
        return res.status(400).json({
          message: "SKU already exists",
        });
      }
    }

    /* -------------------------
       Replace variant images
    ------------------------- */

    if (req.files && req.files.length > 0) {
      /*
        Upload first.
      */

      const uploadedImages = await uploadMultipleImages(
        req.files,
        "products/variants"
      );

      const newImages = formatImages(uploadedImages);

      /*
        Delete old images only after
        successful upload.
      */

      for (const img of variant.images || []) {
        if (img.publicId) {
          await deleteImage(img.publicId);
        }
      }

      variant.images = newImages;
    }

    /* -------------------------
       Update SKU
    ------------------------- */

    if (sku !== undefined) {
      variant.sku = sku;
    }

    /* -------------------------
       Update name
    ------------------------- */

    if (name !== undefined) {
      variant.name = name;
    }

    /* -------------------------
       Update attributes
    ------------------------- */

    if (attributes !== undefined) {
      variant.attributes =
        typeof attributes === "string"
          ? JSON.parse(attributes)
          : attributes;
    }

    /* -------------------------
       Update price
    ------------------------- */

    if (price !== undefined) {
      variant.price =
        typeof price === "string"
          ? JSON.parse(price)
          : price;
    }

    /* -------------------------
       Update stock
    ------------------------- */

    if (stock !== undefined) {
      const parsedStock =
        typeof stock === "string"
          ? JSON.parse(stock)
          : stock;

      variant.stock = parsedStock;

      if (parsedStock?.quantity !== undefined) {
        variant.stock.isInStock = parsedStock.quantity > 0;
      }
    }

    /* -------------------------
       Update size chart
    ------------------------- */

    if (sizeChart !== undefined) {
      variant.sizeChart = sizeChart || null;
    }

    /* -------------------------
       Update active status
    ------------------------- */

    if (isActive !== undefined) {
      variant.isActive = parseBoolean(isActive);
    }

    /* -------------------------
       Save
    ------------------------- */

    await variant.save();

    res.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   DELETE VARIANT
   DELETE /api/products/variants/:id
   Admin
========================================================= */

export const deleteVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findById(req.params.id);

    if (!variant) {
      return res.status(404).json({
        message: "Variant not found",
      });
    }

    /* -------------------------
       Delete Cloudinary images
    ------------------------- */

    for (const img of variant.images || []) {
      if (img.publicId) {
        await deleteImage(img.publicId);
      }
    }

    /* -------------------------
       Delete variant
    ------------------------- */

    await variant.deleteOne();

    res.json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};