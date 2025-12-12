import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

export default function StatsCard({ product, onAddToCart }) {
    const { name, image, price, oldPrice, available, sold } = product;
    const discount = oldPrice && oldPrice > price;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
            {discount && (
                <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    {Math.round(((oldPrice - price) / oldPrice) * 100)}% Off
                </div>
            )}
            
            <img 
                src={image} 
                alt={name} 
                className="w-full h-40 object-cover" 
            />
            
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>
                <p className="text-sm text-gray-500 mb-3">{available} Available • {sold} Sold</p>
                
                <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-gray-900">
                        ${price.toFixed(2)}
                        {oldPrice && <span className="text-sm text-gray-400 line-through ml-2">${oldPrice.toFixed(2)}</span>}
                    </div>
                    <button 
                        onClick={() => onAddToCart(product)}
                        className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition duration-200 focus:outline-none"
                    >
                        <FaShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}