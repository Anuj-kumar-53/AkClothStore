import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HeroSlider.css';

const slides = [
  {
    id: 1,
    title: "Men's New Arrivals",
    subtitle: 'Explore the latest trends with up to 50% off',
    image: 'https://res.cloudinary.com/ddky61mqb/image/upload/v1793544731/Shirts_T-Shirts_Fashion_Banner_ohkmim.png',
    link: '/products?search=Men',
    cta: 'Shop Now',
  },
  {
    id: 2,
    title: "Women's Elegance",
    subtitle: 'Discover elegant styles for every occasion',
    image: 'https://res.cloudinary.com/ddky61mqb/image/upload/v1793544730/Elegant_Ladies_Kurtis_Fashion_Banner_m5tui8.png',
    link: '/products?search=Women',
    cta: 'Shop Now',
  },
  {
    id: 3,
    title: 'Kids Playful Styles',
    subtitle: 'Comfort, style, and fun for your little ones',
    image: 'https://res.cloudinary.com/ddky61mqb/image/upload/v1793546590/Colorful_Kids_Fashion_Dreamland_igzb8n.png',
    link: '/products?search=Kids',
    cta: 'Shop Now',
  },
  {
    id: 4,
    title: "Men's Footwear",
    subtitle: 'Step up your style with every stride',
    image: 'https://res.cloudinary.com/ddky61mqb/image/upload/v1793546360/Premium_Footwear_Showcase_zorkkj.png',
    link: '/products?search=Men%20Footwear',
    cta: 'Shop Now',
  },
  {
    id: 5,
    title: 'Cozy Blanket Collection',
    subtitle: 'Wrap yourself in warmth and comfort',
    image: 'https://res.cloudinary.com/ddky61mqb/image/upload/v1793544732/Cozy_Blanket_Collection_Banner_vhpuob.png',
    link: '/products?search=Blankets',
    cta: 'Shop Now',
  },
  {
    id: 6,
    title: 'Stylish Bags Collection',
    subtitle: 'Carry your essentials in style',
    image: 'https://res.cloudinary.com/ddky61mqb/image/upload/v1793544730/Carry_More_Worry_Less__Bag_Essentials_p4zszu.png',
    link: '/products?search=Bags',
    cta: 'Shop Now',
  },
  {
    id: 7,
    title: 'Traditional Mura Stools',
    subtitle: 'Eco-friendly craftsmanship built to last',
    image: 'https://res.cloudinary.com/ddky61mqb/image/upload/v1793545855/Traditional_Handmade_Mura_Stools_fq9rny.png',
    link: '/products?search=Mura',
    cta: 'Shop Now',
  },
  {
    id: 8,
    title: 'Festive Saree Collection',
    subtitle: 'Celebrate every occasion with timeless elegance',
    image: 'https://res.cloudinary.com/ddky61mqb/image/upload/v1793545450/saree_rp4dez.jpg',
    link: '/products?search=Women%20Sarees',
    cta: 'Shop Now',
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

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

    // Do not initiate drag or capture pointer when clicking directly on a link or button
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }

    startX.current = e.clientX;
    hasDragged.current = false;
    setIsDragging(true);

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        // Ignore pointer capture errors
      }
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;

    const diff = e.clientX - startX.current;

    if (Math.abs(diff) > 40) {
      hasDragged.current = true;

      if (diff < 0) {
        setCurrent(prev => (prev + 1) % slides.length);
      } else {
        setCurrent(prev => (prev - 1 + slides.length) % slides.length);
      }
    }

    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignore pointer release errors
      }
    }

    setIsDragging(false);
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
  };

  // Prevent drag movement from accidentally opening links
  const handleClickCapture = (e) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged.current = false;
    }
  };

  const handleCardClick = (e, slide, offset, index) => {
    if (hasDragged.current) return;

    if (offset !== 0) {
      // Bring clicked side card to center
      setCurrent(index);
    } else if (!e.target.closest('a')) {
      // Clicking anywhere on active card navigates to the products page
      navigate(slide.link);
    }
  };

  const handleBtnClick = (e, slide, offset, index) => {
    if (hasDragged.current) {
      e.preventDefault();
      return;
    }

    if (offset !== 0) {
      e.preventDefault();
      setCurrent(index);
    } else {
      e.stopPropagation();
      navigate(slide.link);
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
              onClick={(e) => handleCardClick(e, slide, offset, index)}
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
                    onClick={(e) => handleBtnClick(e, slide, offset, index)}
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
