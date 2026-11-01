
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HeroSlider.css';

const slides = [
  {
    id: 1,
    title: "Men's New Arrivals",
    subtitle: 'Up to 50% off on the latest trends',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&h=700&fit=crop',
    link: '/products?search=men',
    cta: 'Shop Men',
  },
  {
    id: 2,
    title: "Women's Elegance",
    subtitle: 'Discover styles for every occasion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=700&fit=crop',
    link: '/products?search=women',
    cta: 'Shop Women',
  },
  {
    id: 3,
    title: 'Kids Playful Styles',
    subtitle: 'Comfort and fun for little ones',
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=1600&h=700&fit=crop',
    link: '/products?search=kids',
    cta: 'Shop Kids',
  },
  {
    id: 4,
    title: "Men's Footwear",
    subtitle: 'Step up your style game',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&h=700&fit=crop',
    link: '/products?search=men%20footwear',
    cta: 'Shop Footwear',
  },
  {
    id: 5,
    title: "Women's Footwear",
    subtitle: 'Elegance from heel to toe',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1600&h=700&fit=crop',
    link: '/products?search=women%20footwear',
    cta: 'Shop Footwear',
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const hasDragged = useRef(false);

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev + 1) % slides.length);
  }, []);

  const getOffset = (index) => {
    let offset = (index - current + slides.length) % slides.length;

    if (offset > Math.floor(slides.length / 2)) {
      offset -= slides.length;
    }

    return offset;
  };

  // Pause autoplay while the user is dragging
  useEffect(() => {
    if (isDragging) return;

    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide, isDragging]);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    startX.current = e.clientX;
    hasDragged.current = false;
    setIsDragging(true);

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e) => {
    const diff = e.clientX - startX.current;

    if (Math.abs(diff) > 40) {
      hasDragged.current = true;

      if (diff < 0) {
        setCurrent(prev => (prev + 1) % slides.length);
      } else {
        setCurrent(prev => (prev - 1 + slides.length) % slides.length);
      }
    }

    setIsDragging(false);
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
  };

  // Prevent a drag from accidentally clicking a card or its link
  const handleClickCapture = (e) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged.current = false;
    }
  };

  return (
    <section className="hero-coverflow">

      <div
        className={`coverflow-track ${isDragging ? 'dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
      >

        {slides.map((slide, index) => {
          const offset = getOffset(index);

          if (Math.abs(offset) > 2) return null;

          return (
            <div
              key={slide.id}
              className={`coverflow-card ${offset === 0 ? 'active' : 'side'}`}
              style={{
                '--offset': offset,
                zIndex: 10 - Math.abs(offset),
              }}
              onClick={() => {
                if (offset !== 0) setCurrent(index);
              }}
            >

              <img
                src={slide.image}
                alt={slide.title}
                draggable="false"
              />

              <div className="coverflow-overlay">
                <div className="coverflow-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>

                  <Link
                    to={slide.link}
                    onClick={(e) => {
                      if (offset !== 0) e.preventDefault();
                    }}
                    className="coverflow-btn"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>

            </div>
          );
        })}

      </div>

      {/* Navigation dots */}
      <div className="coverflow-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`coverflow-dot ${current === index ? 'selected' : ''}`}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
};

export default HeroSlider;
