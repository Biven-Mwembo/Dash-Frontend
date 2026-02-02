import {
    LayoutDashboard,
    PackageOpen,
    ShoppingCart,
    Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar({ isOpen }) {
    const [userRole, setUserRole] = useState("user");

    useEffect(() => {
        // Decode JWT to get user role
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setUserRole(payload.role || "user");
            } catch (e) {
                setUserRole("user");
            }
        }
    }, []);

    // Define menu items based on role
    const allMenuItems = [
        { name: "Ventes", icon: <ShoppingCart />, path: "/ventes", roles: ["admin"] },
        { name: "Produits", icon: <PackageOpen />, path: "/produits", roles: ["admin", "user"] },
        { name: "Utilisateurs", icon: <Users />, path: "/utilisateurs", roles: ["admin"] },
    ];

    // Filter menu items based on user role
    const menuItems = allMenuItems.filter((item) =>
        item.roles.includes(userRole)
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex fixed left-0 top-0 flex-col bg-black text-gray-300 border-r border-gray-800 h-screen
                transition-all duration-300 font-poppins z-40 
                ${isOpen ? "w-44" : "w-20"}
                `}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-2 p-6 border-b border-gray-800">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                    {isOpen && (
                        <h3 className="text-lg font-semibold text-white truncate">
                            Dash
                        </h3>
                    )}
                </div>

                {/* Menu */}
                <nav className="flex-1 mt-6">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end
                            className={({ isActive }) =>
                                `flex items-center gap-4 p-3 mx-3 mb-2 rounded-lg transition-all duration-200 
                                ${
                                    isActive
                                        ? "bg-gray-800 text-yellow-400 shadow-lg shadow-yellow-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`
                            }
                        >
                            <span className="text-xl text-shadow-cyan-50">
                                {item.icon}
                            </span>
                            {isOpen && (
                                <span className="text-sm text-white font-medium whitespace-nowrap">
                                    {item.name}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Role Badge (Optional) */}
                {isOpen && (
                    <div className="p-4 border-t border-gray-800">
                        <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${
                                userRole === "admin"
                                    ? "bg-purple-600 text-white"
                                    : "bg-blue-600 text-white"
                            }`}
                        >
                            {userRole === "admin" ? "Administrateur" : "Utilisateur"}
                        </div>
                    </div>
                )}
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-black border-t border-gray-800 flex justify-around py-2 z-40 shadow-2xl">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end
                        className={({ isActive }) =>
                            `flex flex-col items-center p-1 transition-all duration-200 
                            ${
                                isActive
                                    ? "text-yellow-400"
                                    : "text-gray-400 hover:text-yellow-400"
                            }`
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-[10px] mt-1 font-medium">
                            {item.name}
                        </span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
}