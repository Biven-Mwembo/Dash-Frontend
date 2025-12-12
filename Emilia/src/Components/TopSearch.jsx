import React from 'react';
import { FaSearch } from 'react-icons/fa';

export default function TopSearchBar({ setSearchQuery }) {
    return (
        <div className="relative  h-2 flex items-center justify-between mb-2 mt-3">
            <input 
                type="text"
                placeholder="Search menu..."
                className="w-160 pl-10 pr-4 py-2 border-0 bg-gray-100 rounded-xl text-gray-900 focus:outline-none focus:ring-0 placeholder-gray-500 text-sm"
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-4 text-gray-900 text-lg" />
            {/* You could add the "See All" button here if desired */}
        </div>
    );
}