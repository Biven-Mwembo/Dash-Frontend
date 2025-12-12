import React from 'react';
import { 
    FaUtensils, 
    FaCookieBite, 
    FaCoffee, 
    FaMugHot, // Reliable replacement for drinks
    FaPizzaSlice, // Replacement for FaBowlRice or FaDrumstickBite 
    FaHamburger // Replacement for FaDrumstickBite
} from 'react-icons/fa';

// Map categories to reliable icons from the base 'fa' set
const categoryIcons = {
    'All': FaUtensils,
    'Desserts': FaCookieBite,
    'Coffee': FaCoffee,
    'Juice': FaMugHot, // Using FaMugHot as a standard drink placeholder
    'Snack': FaHamburger, // Using FaHamburger for snacks
    'Rice': FaPizzaSlice, // Using FaPizzaSlice as a food placeholder
};

export default function CategoryFilter({ categories, selectedCategory, setSelectedCategory }) {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Category</h2>
                <button className="text-purple-600 text-sm font-medium hover:underline">See All</button>
            </div>
            
            <div className="flex overflow-x-auto space-x-4 pb-2 -mx-6 px-6 scrollbar-hide">
                {categories.map(category => {
                    // Uses the mapped icon, defaults to FaUtensils if not found
                    const Icon = categoryIcons[category] || FaUtensils; 
                    const isActive = selectedCategory === category;
                    const activeClasses = isActive ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50';

                    return (
                        <button 
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`flex flex-col items-center p-3 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 shrink-0 w-24 h-24 ${activeClasses}`}
                        >
                            <Icon className="text-3xl mb-2" />
                            <span className="text-sm font-medium">{category}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}