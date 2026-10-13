import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

import HeroSlider from './HeroSlider';
import ProductCard from './ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentError, setRecentError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products', {
          params: {
            isFeatured: true,
            limit: 8,
            page: 1,
          },
        });

        // Extract products array safely
        let products = [];
        const data = response.data;
        if (Array.isArray(data)) {
          products = data;
        } else if (data && Array.isArray(data.products)) {
          products = data.products;
        } else if (data && Array.isArray(data.data)) {
          products = data.data;
        } else if (data && data.data && Array.isArray(data.data.products)) {
          products = data.data.products;
        } else if (data && data.data && Array.isArray(data.data.data)) {
          products = data.data.data;
        }

        setFeaturedProducts(products);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentProducts = async () => {
      try {
        setRecentLoading(true);
        const response = await api.get('/products', {
          params: {
            sort: '-createdAt', // Assuming backend uses this convention
            limit: 8,
            page: 1,
          },
        });

        let products = [];
        const data = response.data;
        if (Array.isArray(data)) {
          products = data;
        } else if (data && Array.isArray(data.products)) {
          products = data.products;
        } else if (data && Array.isArray(data.data)) {
          products = data.data;
        } else if (data && data.data && Array.isArray(data.data.products)) {
          products = data.data.products;
        } else if (data && data.data && Array.isArray(data.data.data)) {
          products = data.data.data;
        }

        setRecentProducts(products);
        setRecentError(null);
      } catch (err) {
        console.error('Error fetching recent products:', err);
        setRecentError('Failed to load recent products. Please try again later.');
      } finally {
        setRecentLoading(false);
      }
    };

    fetchFeaturedProducts();
    fetchRecentProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
     
      <main className="flex-1">
        <HeroSlider />

        {/* Recently Added Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Recently Added Products</h2>
            <Link to="/products?sort=newest" className="text-pink-600 hover:text-pink-700 font-medium text-sm">
              View All →
            </Link>
          </div>

          {recentLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
            </div>
          ) : recentError ? (
            <div className="text-center text-red-600 py-12 bg-white rounded-xl shadow-sm">{recentError}</div>
          ) : recentProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-white rounded-xl shadow-sm">
              No recent products available.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recentProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Featured Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
            <Link to="/products" className="text-pink-600 hover:text-pink-700 font-medium text-sm">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-12 bg-white rounded-xl shadow-sm">{error}</div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-white rounded-xl shadow-sm">
              No featured products available.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
   
    </div>
  );
};

export default Home;
