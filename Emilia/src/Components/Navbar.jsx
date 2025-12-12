import React from 'react';

// Placeholder user data
const user = {
    name: "User",
    handle: ""
};

export default function Navbar() {
    // Inline SVG for Bell (Lucide equivalent)
    const BellIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-900 bg-transparent">
            {/* Explicitly set fill="none" on the paths */}
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="none" />
            <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" fill="none" />
        </svg>
    );

    // Inline SVG for UserCircle (Lucide equivalent)
    const UserCircleIcon = (
        // The width/height is set to 8x8 Tailwind units (w-8 h-8)
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-900 border-2 border-orange-400 rounded-full bg-white p-0.5">
            {/* This SVG is used as a placeholder image/icon. The styling will rely on the border and background of the SVG itself to give the "outlined" look. */}
            <circle cx="12" cy="12" r="10" fill="none" />
            <circle cx="12" cy="10" r="3" fill="none" />
            <path d="M7.5 20.5a10 10 0 1 0 9 0" fill="none" />
        </svg>
    );

    // Inline SVG for ChevronDown (Lucide equivalent)
    const ChevronDownIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-3 w-4 h-4 text-gray-400 bg-transparent">
            {/* Explicitly set fill="none" on the path */}
            <path d="m6 9 6 6 6-6" fill="none" />
        </svg>
    );

    return (
        <div className="flex justify-end items-center py-2 px-4"> 
            
            {/* Right Section: Profile and Notification */}
            <div className="flex items-center gap-6">

                {/* Notification Icon (Bell) - Icon only with interaction styling */}
                <div 
                    className="relative text-xl cursor-pointer p-1 rounded-full hover:bg-gray-100 transition focus:outline-none"
                    role="button" 
                    tabIndex="0"
                    // onClick={() => handleNotificationClick()} // Placeholder click handler
                >
                    {BellIcon}
                    {/* Red notification dot */}
                    <span className="absolute top-0.5 right-0.5 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                </div>
                
                {/* Profile Card (Mason Taylor) - Minimal/Icon only style */}
                <div 
                    className="flex items-center cursor-pointer rounded-lg hover:bg-gray-100 transition focus:outline-none"
                    role="button" 
                    tabIndex="0"
                    // onClick={() => handleProfileClick()} // Placeholder click handler
                >
                    
                    {/* Profile Image/Icon */}
                    {UserCircleIcon}
                    
                    {/* Text and Dropdown */}
                    <div className="hidden sm:block text-left ml-3 pr-2">
                        <p className="text-sm  text-gray-900 font-semibold leading-none">{user.name}</p>
                        <p className="text-xs text-gray-500 leading-none">{user.handle}</p>
                    </div>

                    {/* Dropdown Arrow */}
                    {ChevronDownIcon}
                </div>

                
            </div>
        </div>
    );
}
