import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import Rating from './Rating';

const ProductCard = ({ product }) => {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const minPrice = Math.min(...(product.variants?.map(v => v.price.sellingPrice) || [0]));
  const maxMrp = Math.max(...(product.variants?.map(v => v.price.mrp) || [0]));
  const discount = maxMrp > 0 ? Math.round(((maxMrp - minPrice) / maxMrp) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden"
    >
      <Link to={`/products/${product.slug}`} className="block relative">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {primaryImage?.url ? (
            <img
              src={primaryImage.url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
        </div>
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {discount}% OFF
          </span>
        )}
        <button
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
          onClick={(e) => { e.preventDefault(); /* wishlist logic */ }}
        >
          <Heart size={18} />
        </button>
      </Link>

      <div className="p-4 space-y-2">
        <Link to={`/products/${product.slug}`} className="block">
          <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.brand?.name}</p>
        </Link>

        <PriceDisplay
          sellingPrice={minPrice}
          mrp={maxMrp}
          className="text-base"
        />

        {product.rating && (
          <Rating value={product.rating} count={product.reviewCount} />
        )}

        <button
          className="w-full mt-2 flex items-center justify-center gap-2 bg-brand-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          onClick={() => {/* add to cart logic */}}
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;