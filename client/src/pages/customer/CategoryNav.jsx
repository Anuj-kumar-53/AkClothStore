import React from 'react';

// Flipkart-style SVGs with signature dual-tone accent (clean dark outline + warm yellow accents)
const CategoryIcons = {
  all: () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer tote bag silhouette */}
      <rect x="9" y="14" width="30" height="28" rx="6" stroke="#1F2937" strokeWidth="2.2" fill="#FFFFFF" />
      {/* Bag handle */}
      <path d="M17 14V11C17 7.13401 20.134 4 24 4C27.866 4 31 7.13401 31 11V14" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
      {/* Yellow accent inner pocket/curve (signature Flipkart For You motif) */}
      <path d="M17 21C17 24.866 20.134 28 24 28C27.866 28 31 24.866 31 21" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" fill="#FEF3C7" />
    </svg>
  ),

  shirt: () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Collared formal/casual shirt */}
      <path d="M15 11L9 17L13 22L17 19V41H31V19L35 22L39 17L33 11H15Z" stroke="#1F2937" strokeWidth="2.2" strokeLinejoin="round" fill="#FFFFFF" />
      {/* Yellow collar accents */}
      <path d="M15 11L21 21L24 16L27 21L33 11" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
      {/* Front buttons */}
      <circle cx="24" cy="26" r="1.5" fill="#1F2937" />
      <circle cx="24" cy="32" r="1.5" fill="#1F2937" />
      {/* Left pocket */}
      <path d="M26 25H29V29H26V25Z" stroke="#1F2937" strokeWidth="1.5" />
    </svg>
  ),

  't-shirt': () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* T-shirt silhouette */}
      <path d="M15 11L7 18L12 24L16 21V41H32V21L36 24L41 18L33 11C30 14 27 15 24 15C21 15 18 14 15 11Z" stroke="#1F2937" strokeWidth="2.2" strokeLinejoin="round" fill="#FFFFFF" />
      {/* Round crew neck */}
      <path d="M18 11C19.5 14.5 28.5 14.5 30 11" stroke="#1F2937" strokeWidth="2.2" strokeLinecap="round" />
      {/* Signature yellow hem accent (matching Flipkart fashion icon) */}
      <rect x="16" y="37" width="16" height="4" rx="1" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.8" />
    </svg>
  ),

  pants: () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trousers silhouette */}
      <path d="M13 7H35L33 42H26L24 24L22 42H15L13 7Z" stroke="#1F2937" strokeWidth="2.2" strokeLinejoin="round" fill="#FFFFFF" />
      {/* Yellow waistband accent */}
      <rect x="13" y="7" width="22" height="6" rx="1" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.8" />
      {/* Fly / button line */}
      <path d="M24 13V19" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" />
      {/* Side pockets */}
      <path d="M15 17L19 21" stroke="#1F2937" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M33 17L29 21" stroke="#1F2937" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),

  slippers: () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Modern slide / flip-flop outline */}
      <ellipse cx="24" cy="27" rx="12" ry="16" stroke="#1F2937" strokeWidth="2.2" fill="#FFFFFF" />
      {/* Inner cushion contour */}
      <ellipse cx="24" cy="27" rx="9" ry="13" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Yellow V-strap / band */}
      <path d="M15 26L24 19L33 26" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Toe post / grip */}
      <circle cx="24" cy="19" r="2.2" fill="#1F2937" />
      {/* Sole edge line */}
      <path d="M13 32C15 39 33 39 35 32" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),

  shoes: () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sneaker silhouette */}
      <path d="M7 32C7 24 12 21 16 20L21 20L26 13H33L37 20C40 23 42 27 42 32H7Z" stroke="#1F2937" strokeWidth="2.2" strokeLinejoin="round" fill="#FFFFFF" />
      {/* Yellow cushioned outsole */}
      <rect x="6" y="32" width="37" height="6" rx="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      {/* Shoelaces */}
      <path d="M24 18L28 22" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M22 22L26 26" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" />
      {/* Heel collar */}
      <path d="M12 22C11 20 12 17 15 16" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  blanket: () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stacked folded cozy blankets */}
      <rect x="10" y="27" width="28" height="11" rx="4" stroke="#1F2937" strokeWidth="2.2" fill="#FFFFFF" />
      {/* Yellow top folded blanket layer */}
      <rect x="8" y="16" width="32" height="11" rx="4" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      {/* Folded edge quilt texture */}
      <path d="M14 21H34" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 3" />
      <path d="M16 32H32" stroke="#1F2937" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 3" />
      {/* Cozy throw tassel */}
      <circle cx="36" cy="21.5" r="1.5" fill="#F59E0B" />
    </svg>
  ),

  jackets: () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Winter jacket silhouette */}
      <path d="M15 11L7 18L12 24L16 21V41H32V21L36 24L41 18L33 11H15Z" stroke="#1F2937" strokeWidth="2.2" strokeLinejoin="round" fill="#FFFFFF" />
      {/* High hooded collar with yellow accent */}
      <path d="M17 11C17 7 31 7 31 11" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" fill="#FEF3C7" />
      {/* Center heavy zipper */}
      <path d="M24 11V41" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      {/* Yellow zipper pull tag */}
      <rect x="22.5" y="18" width="3" height="5" rx="1.5" fill="#F59E0B" />
      {/* Pockets */}
      <path d="M18 29H21V34H18V29Z" stroke="#1F2937" strokeWidth="1.5" />
      <path d="M27 29H30V34H27V29Z" stroke="#1F2937" strokeWidth="1.5" />
    </svg>
  ),

  bags: () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Backpack silhouette */}
      <rect x="12" y="13" width="24" height="28" rx="8" stroke="#1F2937" strokeWidth="2.2" fill="#FFFFFF" />
      {/* Top loop handle */}
      <path d="M20 13V8C20 6.5 21.5 5 24 5C26.5 5 28 6.5 28 8V13" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      {/* Front pocket with yellow accent */}
      <rect x="15" y="26" width="18" height="12" rx="4" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      {/* Pocket zip & buckle */}
      <path d="M17 29H31" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="22.5" y="31" width="3" height="4" rx="1" fill="#1F2937" />
    </svg>
  ),
};

const CATEGORIES = [
  { id: 'all', label: 'For You', icon: CategoryIcons.all },
  { id: 'shirt', label: 'Shirt', icon: CategoryIcons.shirt },
  { id: 't-shirt', label: 'T-Shirt', icon: CategoryIcons['t-shirt'] },
  { id: 'pants', label: 'Pants', icon: CategoryIcons.pants },
  { id: 'slippers', label: 'Slippers', icon: CategoryIcons.slippers },
  { id: 'shoes', label: 'Shoes', icon: CategoryIcons.shoes },
  { id: 'blanket', label: 'Blanket', icon: CategoryIcons.blanket },
  { id: 'jackets', label: 'Jackets', icon: CategoryIcons.jackets },
  { id: 'bags', label: 'Bags', icon: CategoryIcons.bags },
];

const CategoryNav = ({ activeCategory = 'all', onSelectCategory }) => {
  return (
    <section className="bg-white border-b border-gray-200/90 shadow-xs relative z-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Horizontal scrollable container for mobile with responsive spacing */}
        <div className="flex items-center justify-between sm:justify-around overflow-x-auto scrollbar-none py-3 px-2 gap-2 sm:gap-4 scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const IconComponent = cat.icon;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectCategory) {
                    onSelectCategory(cat.id);
                  }
                }}
                className="group flex flex-col items-center justify-center shrink-0 cursor-pointer transition-all duration-200 focus:outline-hidden py-1 px-2 select-none"
                aria-label={`Filter by ${cat.label}`}
                aria-pressed={isActive}
              >
                {/* Icon box: soft light rounded background when active, just like Flipkart! */}
                <div
                  className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-200 ${isActive
                      ? 'bg-sky-100/70 shadow-xs scale-105'
                      : 'bg-transparent group-hover:bg-gray-100/80 group-hover:scale-105'
                    }`}
                >
                  <IconComponent />
                </div>

                {/* Category Label */}
                <span
                  className={`mt-1.5 text-xs sm:text-sm tracking-tight text-center whitespace-nowrap transition-colors duration-200 ${isActive
                      ? 'font-bold text-gray-900'
                      : 'font-medium text-gray-700 group-hover:text-gray-900'
                    }`}
                >
                  {cat.label}
                </span>

                {/* Active Indicator Line (Flipkart blue bar) */}
                <div
                  className={`h-1 w-8 sm:w-10 rounded-full mt-1 transition-all duration-200 ${isActive ? 'bg-blue-600 opacity-100 scale-100 shadow-xs' : 'opacity-0 scale-75 bg-transparent'
                    }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryNav;
