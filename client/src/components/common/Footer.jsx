import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛍️</span>
              <h3 className="text-white text-xl font-bold">
                AK Cloth Store
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-gray-400">
              Premium fashion for men, women, and kids. Quality you can trust.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?search=men" className="hover:text-pink-400 transition-colors">
                  Men's Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?search=women" className="hover:text-pink-400 transition-colors">
                  Women's Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?search=kids" className="hover:text-pink-400 transition-colors">
                  Kids' Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?search=men%20footwear" className="hover:text-pink-400 transition-colors">
                  Men's Footwear
                </Link>
              </li>
              <li>
                <Link to="/products?search=women%20footwear" className="hover:text-pink-400 transition-colors">
                  Women's Footwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-3">
              Customer Service
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@akclothstore.com" className="hover:text-pink-400 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="#" className="hover:text-pink-400 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-pink-400 transition-colors">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-pink-400 transition-colors">
                  Returns &amp; Only from Store
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-pink-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-3">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <span>TCP Gate Kohima</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <span>+91 9863610906</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <a href="mailto:kabhisekh395@gmail.com" className="hover:text-pink-400 transition-colors break-all">
                  support@kabhisekh395@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} AK Cloth Store. All rights reserved.</p>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-pink-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-pink-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;