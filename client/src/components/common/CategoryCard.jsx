import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/products?category=${category._id}`}
      className="group bg-white rounded-xl shadow-card hover:shadow-card-hover transition p-4 text-center"
    >
      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full overflow-hidden group-hover:scale-105 transition">
        {category.image?.url ? (
          <img src={category.image.url} alt={category.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">{category.name[0]}</div>
        )}
      </div>
      <p className="mt-2 font-medium text-gray-700 group-hover:text-brand-primary transition">{category.name}</p>
    </Link>
  );
};

export default CategoryCard;