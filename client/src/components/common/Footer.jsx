import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Newsletter */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              <h3 className="text-white text-xl font-bold">AK Cloth Store</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Premium fashion for men, women, and kids. Quality you can trust.
            </p>
            <div>
              <p className="text-sm font-medium mb-3">Subscribe to our newsletter</p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-gray-800 text-white rounded-l-lg px-4 py-2.5 text-sm outline-none border border-gray-700 focus:border-pink-500 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-r-lg transition-colors flex items-center gap-1"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=men" className="hover:text-pink-400 transition-colors">Men's Fashion</Link></li>
              <li><Link to="/products?category=women" className="hover:text-pink-400 transition-colors">Women's Fashion</Link></li>
              <li><Link to="/products?category=kids" className="hover:text-pink-400 transition-colors">Kids' Fashion</Link></li>
              <li><Link to="/products?category=footwear" className="hover:text-pink-400 transition-colors">Footwear</Link></li>
              <li><Link to="/products?category=others" className="hover:text-pink-400 transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-pink-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Track Your Order</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <span>123 Fashion Street, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <span>support@akclothstore.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} AK Cloth Store. All rights reserved.</p>
          <div className="flex space-x-6 mt-3 md:mt-0">
            <a href="#" className="hover:text-pink-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-pink-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-pink-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;