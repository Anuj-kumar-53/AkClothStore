import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, ChevronDown, Menu, X } from 'lucide-react';
import { SignInButton, UserButton, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import api from '../../utils/api';

// ---------- Category Data ----------
const categories = [
  {
    name: 'Men',
    items: [
      { type: 'Clothing', subItems: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Shorts', 'Kurtas'] },
      { type: 'Footwear', subItems: ['Shoes', 'Sandals', 'Slippers', 'Sports Shoes'] },
    ],
  },
  {
    name: 'Women',
    items: [
      { type: 'Clothing', subItems: ['Dresses', 'Tops', 'Jeans', 'Skirts', 'Sarees', 'Kurtis'] },
      { type: 'Footwear', subItems: ['Heels', 'Flats', 'Sandals', 'Shoes'] },
    ],
  },
  {
    name: 'Kids',
    items: [
      { type: 'Clothing', subItems: ['T-Shirts', 'Shorts', 'Dresses', 'Ethnic Wear'] },
      { type: 'Footwear', subItems: ['Shoes', 'Sandals', 'Slippers'] },
    ],
  },
  {
    name: 'Others',
    items: [
      { type: 'Home & Living', subItems: ['Blankets', 'Bedsheets', 'Curtains'] },
      { type: 'Accessories', subItems: ['Bags', 'Belts', 'Watches'] },
    ],
  },
];

// ---------- Navbar Component ----------
const Navbar = ({ isAdmin }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const fetchCartCount = async () => {
    if (!isSignedIn) {
      setCartCount(0);
      return;
    }
    try {
      const res = await api.get('/cart');
      setCartCount(res.data.data?.totalItems || 0);
    } catch (err) {
      console.error('Failed to fetch cart count', err);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cart_updated', handleCartUpdate);
    return () => window.removeEventListener('cart_updated', handleCartUpdate);
  }, [isSignedIn]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ---------- Logo ---------- */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <ShoppingBag className="h-8 w-8 text-pink-600" />
            <span className="text-xl font-extrabold tracking-tight text-gray-800">
              AK<span className="text-pink-600">Cloth</span>
            </span>
          </Link>

          {/* ---------- Desktop Navigation (Categories) ---------- */}
          <nav className="hidden lg:flex items-center space-x-6">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(cat.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 text-gray-700 hover:text-pink-600 font-medium transition-colors py-2">
                  {cat.name}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      activeDropdown === cat.name ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === cat.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl py-5 px-6 border border-gray-100"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        {cat.items.map((section, idx) => (
                          <div key={idx}>
                            <h4 className="text-sm font-bold text-pink-600 mb-2 uppercase tracking-wide">
                              {section.type}
                            </h4>
                            <ul className="space-y-2">
                              {section.subItems.map((item) => (
                                <li key={item}>
                                  <Link
                                    to={`/products?search=${encodeURIComponent(cat.name + " " + item)}`}
                                    className="text-sm text-gray-600 hover:text-pink-600 hover:pl-1 transition-all"
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* ---------- Search Bar (Desktop) ---------- */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full bg-gray-100 rounded-full py-2 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* ---------- Right Side – Clerk Auth & Links ---------- */}
          <div className="flex items-center space-x-2">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-full hover:bg-pink-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {/* Cart */}
              <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
                <ShoppingBag className="h-6 w-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-0 -right-0 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Orders */}
              <Link
                to="/orders"
                className="hidden sm:inline-block text-sm font-medium text-gray-700 hover:text-pink-600 px-3 py-2"
              >
                Orders
              </Link>

              {/* Profile */}
              <Link
                to="/profile"
                className="hidden sm:inline-block text-sm font-medium text-gray-700 hover:text-pink-600 px-3 py-2"
              >
                Profile
              </Link>

              {/* Admin Panel – only when isAdmin is true */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-block text-sm font-medium text-red-600 hover:text-red-800 px-3 py-2"
                >
                  Admin Panel
                </Link>
              )}

              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Mobile Menu ---------- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Categories in mobile */}
              {categories.map((cat) => (
                <div key={cat.name} className="py-2">
                  <h4 className="font-semibold text-gray-800 mb-1">{cat.name}</h4>
                  <div className="pl-4 space-y-1">
                    {cat.items.map((section) => (
                      <div key={section.type}>
                        <p className="text-xs text-pink-600 uppercase font-medium">
                          {section.type}
                        </p>
                        {section.subItems.map((item) => (
                          <Link
                            key={item}
                            to={`/products?search=${encodeURIComponent(cat.name + " " + item)}`}
                            className="block text-sm text-gray-600 py-0.5 hover:text-pink-600"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Mobile Auth Links */}
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="w-full text-left text-sm font-medium text-pink-600 py-2">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/cart" className="block text-sm text-gray-700 py-1 hover:text-pink-600">
                    Cart
                  </Link>
                  <Link to="/orders" className="block text-sm text-gray-700 py-1 hover:text-pink-600">
                    Orders
                  </Link>
                  <Link to="/profile" className="block text-sm text-gray-700 py-1 hover:text-pink-600">
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block text-sm text-red-600 py-1 hover:text-red-800">
                      Admin Panel
                    </Link>
                  )}
                </SignedIn>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="pt-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;