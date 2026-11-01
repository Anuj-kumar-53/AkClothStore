import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

import HeroSlider from './HeroSlider';
import ProductCard from './ProductCard';
import CategoryNav from './CategoryNav';

// Product skeleton card matching ProductCard layout
const ProductSkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-gray-100 animate-pulse">
    <div className="aspect-[3/4] bg-gray-200" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="h-5 bg-gray-200 rounded w-1/2 pt-1" />
    </div>
  </div>
);

const CATEGORY_TITLES = {
  all: 'All Products',
  shirt: 'Shirts',
  't-shirt': 'T-Shirts',
  pants: 'Pants & Trousers',
  slippers: 'Slippers & Slides',
  shoes: 'Shoes & Sneakers',
  blanket: 'Blankets & Quilts',
  jackets: 'Jackets & Winter Wear',
  bags: 'Bags & Backpacks',
};

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [moreError, setMoreError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // References to handle race conditions and cancel pending requests
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Core fetch function with server-side pagination & category filtering
  const fetchProducts = useCallback(
    async ({ category, pageToFetch, isAppend = false }) => {
      if (isAppend) {
        setLoadingMore(true);
        setMoreError(null);
      } else {
        setLoadingInitial(true);
        setError(null);
        setMoreError(null);
      }

      // Abort any prior in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Track request ID so obsolete responses never overwrite state
      const currentRequestId = ++requestIdRef.current;

      try {
        const params = {
          page: pageToFetch,
          limit: 12,
        };

        if (category && category !== 'all') {
          params.productType = category;
        }

        const response = await api.get('/products', {
          params,
          signal: controller.signal,
        });

        // Ignore response if user switched category or triggered another fetch in the meantime
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const fetchedItems = response.data?.data || [];
        const total = response.data?.total ?? fetchedItems.length;
        const totalPages = response.data?.pages ?? Math.ceil(total / 12);

        setTotalProducts(total);

        if (isAppend) {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p._id || p.id));
            const uniqueNew = fetchedItems.filter(
              (p) => !existingIds.has(p._id || p.id)
            );
            return [...prev, ...uniqueNew];
          });
        } else {
          setProducts(fetchedItems);
        }

        setPage(pageToFetch);
        setHasMore(pageToFetch < totalPages && fetchedItems.length > 0);
        setError(null);
        setMoreError(null);
      } catch (err) {
        // Ignore aborted requests
        if (
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED' ||
          err?.message === 'canceled'
        ) {
          return;
        }

        if (currentRequestId === requestIdRef.current) {
          console.error('Error fetching products:', err);
          if (isAppend) {
            setMoreError('Failed to load more products. Please try again.');
          } else {
            setError(
              'Failed to load products. Please check your connection and try again.'
            );
          }
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          if (isAppend) {
            setLoadingMore(false);
          } else {
            setLoadingInitial(false);
          }
        }
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchProducts({ category: 'all', pageToFetch: 1, isAppend: false });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Category switch handler: resets pagination and fetches first 12 items immediately
  const handleCategorySelect = (categoryId) => {
    if (categoryId === activeCategory) return;

    setActiveCategory(categoryId);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setMoreError(null);

    fetchProducts({ category: categoryId, pageToFetch: 1, isAppend: false });
  };

  // IntersectionObserver for infinite scrolling as user scrolls towards bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          hasMore &&
          !loadingInitial &&
          !loadingMore &&
          !error &&
          !moreError
        ) {
          fetchProducts({
            category: activeCategory,
            pageToFetch: page + 1,
            isAppend: true,
          });
        }
      },
      {
        root: null,
        rootMargin: '250px', // Pre-fetch slightly before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [
    hasMore,
    loadingInitial,
    loadingMore,
    error,
    moreError,
    activeCategory,
    page,
    fetchProducts,
  ]);

  // Retry handlers
  const handleRetryInitial = () => {
    fetchProducts({ category: activeCategory, pageToFetch: 1, isAppend: false });
  };

  const handleRetryMore = () => {
    fetchProducts({
      category: activeCategory,
      pageToFetch: page + 1,
      isAppend: true,
    });
  };

  const currentTitle = CATEGORY_TITLES[activeCategory] || 'Products';

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* Flipkart-inspired Category Icon Navigation Bar */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* Main Product Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {currentTitle}
            </h2>
            {!loadingInitial && totalProducts > 0 && (
              <span className="text-xs sm:text-sm font-semibold text-pink-600 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full">
                {totalProducts} {totalProducts === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          <Link
            to="/products"
            className="text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors self-start sm:self-auto"
          >
            Explore All Categories →
          </Link>
        </div>

        {/* Initial Loading State: 12 Skeleton Cards */}
        {loadingInitial && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductSkeletonCard key={`skel-${i}`} />
            ))}
          </div>
        )}

        {/* Initial Error State */}
        {!loadingInitial && error && (
          <div className="text-center py-12 px-6 bg-white rounded-2xl shadow-xs border border-red-100 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Unable to load products
            </h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              type="button"
              onClick={handleRetryInitial}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-medium text-sm transition-colors shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingInitial && !error && products.length === 0 && (
          <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-xs border border-gray-100 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No products found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              We currently don&apos;t have any items under &ldquo;{currentTitle}&rdquo;.
              Check back soon or explore our other collections.
            </p>
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-medium text-sm transition-colors shadow-xs"
            >
              Show All Products
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loadingInitial && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}

              {/* Skeleton placeholders while loading subsequent batches */}
              {loadingMore &&
                Array.from({ length: 4 }).map((_, i) => (
                  <ProductSkeletonCard key={`more-skel-${i}`} />
                ))}
            </div>

            {/* Error while loading more batches */}
            {moreError && (
              <div className="text-center py-6 mt-6">
                <p className="text-sm text-red-600 mb-3">{moreError}</p>
                <button
                  type="button"
                  onClick={handleRetryMore}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Loading More
                </button>
              </div>
            )}

            {/* End of Products Message */}
            {!hasMore && !loadingMore && products.length > 0 && (
              <div className="text-center py-10 mt-6 border-t border-gray-200">
                <p className="text-gray-400 text-sm font-medium">
                  🎉 You&apos;ve viewed all {products.length} products
                </p>
              </div>
            )}
          </>
        )}

        {/* Invisible Sentinel element for IntersectionObserver */}
        <div ref={sentinelRef} className="h-4 w-full pointer-events-none" />
      </section>
    </div>
  );
};

export default Home;
