import React from 'react';

const PriceDisplay = ({ sellingPrice, mrp, className = '' }) => {
  const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-bold text-gray-900">₹{sellingPrice}</span>
      {mrp > sellingPrice && (
        <>
          <span className="text-gray-400 line-through text-sm">₹{mrp}</span>
          <span className="text-green-600 text-sm font-medium">{discount}% off</span>
        </>
      )}
    </div>
  );
};

export default PriceDisplay;