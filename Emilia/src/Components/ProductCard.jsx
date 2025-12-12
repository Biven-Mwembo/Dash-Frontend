import React from 'react';

// Replaced FaShoppingCart import with inline SVG definition
const ShoppingCartIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
        <path fill="currentColor" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h406.8c24.6 0 46.5 18 50.4 42.6l-29.7 176.2c-3.2 19.1-19.5 33.4-39.1 33.4H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H472c11.1 0 20.7-6.1 25.9-15.8s6.3-21.4 4.1-32.6l-11.1-55.3c-2.3-11.4-12.7-20.1-24.3-20.1H160.8l-10.5-62.2L168 112H532c13.3 0 24-10.7 24-24s-10.7-24-24-24H168.1L163 76.2l-4.5-8.4c-7.9-14.4-24.1-22.9-41.1-22.9H24C10.7 48 0 37.3 0 24zM224 480c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32zm304-32c0 17.7-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32z"/>
    </svg>
);

export default function ProductCard({ product, onAddToCart }) {
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
                className="w-full h-30 object-cover" 
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src="https://placehold.co/300x120/9CA3AF/FFFFFF?text=Product+Image";
                }}
            />
            
            <div className="p-2">
                <h3 className="text-m font-semibold text-gray-800 mb-1">{name}</h3>
                <p className="text-sm text-gray-500 mb-3">{available} Available • {sold} Sold</p>
                
                <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-gray-900">
                        ${price.toFixed(2)}
                        {oldPrice && <span className="text-sm text-gray-400 line-through ml-2">${oldPrice.toFixed(2)}</span>}
                    </div>
                    {/* Updated to use the inline SVG component */}
                    <span 
                        onClick={() => onAddToCart(product)}
                        className="text-purple-600 p-2 cursor-pointer transition duration-200 hover:text-purple-700"
                        role="button"
                        tabIndex="0"
                        aria-label="Add to cart"
                    >
                        <ShoppingCartIcon className="w-6 h-6" />
                    </span>
                </div>
            </div>
        </div>
    );
}
