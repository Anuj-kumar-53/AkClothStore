import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useState } from 'react';

const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  // Assuming product structure: { _id, name, slug, brand, images, variants[], averageRating? }
  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop';
  const price = product.variants?.[0]?.price || { mrp: 0, sellingPrice: 0, discount: 0 };
  const discountPercent = price.discount
    ? Math.round(((price.mrp - price.sellingPrice) / price.mrp) * 100)
    : 0;
  const rating = product.averageRating || 4.5;
  const reviewsCount = product.reviewsCount || 100;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {discountPercent > 0 && (
            <span className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
              {discountPercent}% OFF
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-pink-50 transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-pink-600 text-pink-600' : 'text-gray-500'}`} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.brand?.name || 'Brand'}</p>
          <h3 className="text-sm font-medium text-gray-800 truncate">{product.name}</h3>
          <div className="flex items-center mt-1 text-xs text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="ml-1 font-semibold text-gray-700">{rating}</span>
            <span className="text-gray-400 ml-1">({reviewsCount})</span>
          </div>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-lg font-bold text-gray-900">₹{price.sellingPrice}</span>
            {price.mrp > price.sellingPrice && (
              <span className="text-sm text-gray-400 line-through">₹{price.mrp}</span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={() => {
          // Add to cart logic (will connect later)
          console.log('Add to cart:', product._id);
        }}
        className="absolute bottom-4 right-4 p-2 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 transform hover:scale-110 transition-all"
        aria-label="Add to cart"
      >
        <ShoppingBag className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ProductCard;