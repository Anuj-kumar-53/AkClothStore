import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Men's New Arrivals",
    subtitle: 'Up to 50% off on the latest trends',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&h=700&fit=crop', // fashion man
    link: '/products?search=men',
    cta: 'Shop Men',
  },
  {
    id: 2,
    title: "Women's Elegance",
    subtitle: 'Discover styles for every occasion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=700&fit=crop', // fashion woman
    link: '/products?search=women',
    cta: 'Shop Women',
  },
  {
    id: 3,
    title: 'Kids Playful Styles',
    subtitle: 'Comfort and fun for little ones',
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1600&h=700&fit=crop', // kids
    link: '/products?search=kids',
    cta: 'Shop Kids',
  },
  {
    id: 4,
    title: "Men's Footwear",
    subtitle: 'Step up your style game',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&h=700&fit=crop', // shoes
    link: '/products?search=men%20footwear',
    cta: 'Shop Footwear',
  },
  {
    id: 5,
    title: "Women's Footwear",
    subtitle: 'Elegance from heel to toe',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&h=700&fit=crop', // women shoes
    link: '/products?search=women%20footwear',
    cta: 'Shop Footwear',
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-[70vh] overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-2xl">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 drop-shadow-lg"
            >
              {slides[current].title}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-gray-200 mb-6"
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link
                to={slides[current].link}
                className="inline-block bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-pink-600 hover:text-white transition-all shadow-lg transform hover:scale-105"
              >
                {slides[current].cta}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 rounded-full transition-all ${
              idx === current ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;