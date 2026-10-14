import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import api from "../../utils/api";

function ProductDetails() {
  const { slug } = useParams();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/products/${slug}`);
        const data = response.data.data;
        setProduct(data);

        // Set default selected attributes from first variant
        if (data.variants?.length > 0) {
          const first = data.variants[0];
          setSelectedColor(first.attributes?.color || "");
          setSelectedSize(first.attributes?.size || "");
        } else {
          setSelectedColor("");
          setSelectedSize("");
        }

        // Fetch related products
        if (data.category?._id) {
          try {
            const relatedRes = await api.get(`/products?category=${data.category._id}&limit=5`);
            setRelatedProducts(relatedRes.data.data.filter((p) => p._id !== data._id).slice(0, 4));
          } catch (err) {
            console.error("Failed to load related products", err);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const availableColors = [
    ...new Set(product?.variants?.map((v) => v.attributes?.color).filter(Boolean)),
  ];

  const availableSizes = [
    ...new Set(
      product?.variants
        ?.filter((v) => !selectedColor || v.attributes?.color === selectedColor)
        ?.map((v) => v.attributes?.size)
        .filter(Boolean)
    ),
  ];

  const selectedVariant = product?.variants?.find(
    (v) =>
      v.attributes?.color === selectedColor &&
      v.attributes?.size === selectedSize
  );


  const variantImages = (selectedVariant?.images || [])
    .map((img) => {
      if (!img) return null;
      if (typeof img === "string") return { url: img, altText: "" };
      const url = img.url || img.secure_url || img.src;
      return url ? { url, altText: img.altText || "" } : null;
    })
    .filter(Boolean);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const sizesForColor = [
      ...new Set(
        product?.variants
          ?.filter((v) => v.attributes?.color === color)
          ?.map((v) => v.attributes?.size)
          .filter(Boolean)
      ),
    ];
    if (!sizesForColor.includes(selectedSize)) {
      setSelectedSize(sizesForColor[0] || "");
    }
  };

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (!selectedVariant) {
      setCartMessage("Please select available options.");
      return;
    }

    setAdding(true);
    setCartMessage("");
    try {
      await api.post("/cart/items", {
        productVariantId: selectedVariant._id,
        quantity,
      });
      setCartMessage("Added to cart successfully!");
      window.dispatchEvent(new Event("cart_updated"));
    } catch (err) {
      console.error("Add to cart failed:", err);
      setCartMessage("Failed to add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading product...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="p-8 text-center">Product not found.</div>;
  }

  const sellingPrice = selectedVariant
    ? selectedVariant.price.sellingPrice
    : Math.min(...(product.variants?.map((v) => v.price.sellingPrice) || [0]));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Product Images Carousel */}
        <div className="space-y-4 relative">
          <div className="md:sticky md:top-24">
            <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {variantImages.length > 0 ? (
                <Swiper
                  key={selectedVariant?._id || "no-variant"}
                  modules={[Autoplay, Pagination]}
                  spaceBetween={0}
                  slidesPerView={1}
                  loop={variantImages.length > 1}
                  autoplay={
                    variantImages.length > 1
                      ? { delay: 4000, disableOnInteraction: false }
                      : false
                  }
                  pagination={{ clickable: true }}
                  grabCursor={true}
                  className="w-full h-full product-image-swiper"
                >
                  {variantImages.map((img, idx) => (
                    <SwiperSlide key={`${img.url}-${idx}`}>
                      <img
                        src={img.url}
                        alt={img.altText || product.name}
                        className="w-full h-full object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
          {product.brand && (
            <p className="text-gray-600">Brand: {product.brand.name}</p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">
              ₹{sellingPrice}
            </span>
            {selectedVariant && selectedVariant.price.mrp > selectedVariant.price.sellingPrice && (
              <>
                <span className="text-gray-400 line-through">
                  ₹{selectedVariant.price.mrp}
                </span>
                <span className="text-pink-600 font-medium">
                  {selectedVariant.price.discount}% off
                </span>
              </>
            )}
          </div>

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Color: {selectedColor}</h3>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedColor === color
                        ? "border-pink-600 bg-pink-50 text-pink-700 font-medium"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Size: {selectedSize}</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size
                        ? "border-pink-600 bg-pink-50 text-pink-700 font-medium"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <h3 className="font-medium">Quantity:</h3>
            <div className="flex items-center border rounded">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="px-3 py-1 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock & SKU */}
          {selectedVariant && (
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                {selectedVariant.stock.quantity > 0
                  ? `In Stock: ${selectedVariant.stock.quantity}`
                  : "Out of Stock"}
              </p>
              <p className="text-sm text-gray-500">SKU: {selectedVariant.sku}</p>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || !selectedVariant || selectedVariant.stock.quantity < 1}
            className="w-full md:w-auto px-8 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>

          {/* Description */}
          {product.description && (
            <div className="pt-8 mt-8 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Product Description</h3>
              <div className="prose prose-sm text-gray-600">
                <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => {
              const rpImage = rp.images?.find((img) => img.isPrimary) || rp.images?.[0];
              const rpPrices = rp.variants?.map((v) => v.price.sellingPrice) || [];
              const rpMinPrice = rpPrices.length > 0 ? Math.min(...rpPrices) : 0;

              return (
                <Link
                  key={rp._id}
                  to={`/products/${rp.slug}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
                >
                  <div className="relative h-64 bg-gray-50 overflow-hidden">
                    {rpImage?.url ? (
                      <img
                        src={rpImage.url}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-pink-600 font-semibold mb-1 uppercase tracking-wider">{rp.brand?.name}</p>
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 flex-1 group-hover:text-pink-600 transition-colors">
                      {rp.name}
                    </h3>
                    <div className="font-bold text-gray-900">₹{rpMinPrice}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {cartMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50"
          >
            <div className={`w-2 h-2 rounded-full ${cartMessage.includes("Failed") ? "bg-red-500" : "bg-green-500"}`}></div>
            <p className="font-medium text-sm">{cartMessage}</p>
            <button type="button" onClick={() => setCartMessage("")} className="ml-4 text-gray-400 hover:text-white">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .product-image-swiper,
        .product-image-swiper .swiper-wrapper,
        .product-image-swiper .swiper-slide {
          height: 100%;
        }
        .product-image-swiper .swiper-pagination-bullet-active {
          background: #db2777;
        }
      `}</style>
    </div>
  );
}

export default ProductDetails;
