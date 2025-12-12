import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react"; 

// Define screen size break point (Tailwind default is md/lg)
const BREAKPOINT_LG = 1024; 

// Define the mobile bottom padding needed (The Sidebar's mobile nav uses py-2, which is roughly h-14/16 total)
// We will use pb-16 (64px) to ensure clearance.
const MOBILE_BOTTOM_PADDING_CLASS = "pb-16 lg:pb-0";

export default function PageLayout() {
    // Start closed on small screens, open on large screens
    const [isOpen, setIsOpen] = useState(window.innerWidth >= BREAKPOINT_LG);
    const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINT_LG);

    // Effect to update the initial state and handle resize events
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < BREAKPOINT_LG;
            setIsMobile(mobile);
            
            // On desktop, keep the sidebar open
            if (!mobile) {
                setIsOpen(true);
            } else {
                // On mobile, force the sidebar closed (it's hidden/replaced by BottomNav)
                setIsOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        // Initial check and cleanup
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <div className="flex flex-col min-h-screen">
            
            {/* 1. Sidebar component (Handles both fixed desktop and mobile bottom nav internally) */}
            <Sidebar 
                isOpen={isOpen} 
                setIsOpen={toggleSidebar} 
            />

            {/* 2. Main Content Area */}
            {/* Added dynamic bottom padding (pb-16) only on mobile screens to clear the fixed bottom nav. */}
            <div
                className={`
                    flex-1 bg-gray-50 min-h-screen transition-all duration-300 w-auto
                    ${isMobile ? "ml-0" : (isOpen ? "lg:ml-44" : "lg:ml-20")}
                    ${isMobile ? MOBILE_BOTTOM_PADDING_CLASS : "pb-0"}
                `}
            >
                {/* Navbar component */}
                <Navbar isOpen={isOpen} setIsOpen={toggleSidebar} /> 

                {/* Main page content area. */}
                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}