import React, { useState, useEffect, useRef } from "react";
import { Bell, User, ChevronDown, LogOut, Settings, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { fetchWithAuth } from "../apiConfig";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "User", email: "" });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Logic remains identical to your original code
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          name: payload.name || payload.email?.split("@")[0] || "User",
          email: payload.email || "",
          role: payload.role || "user",
        });
      } catch (e) {
        console.error("Failed to decode token");
      }
    }
  }, []);

  useEffect(() => {
    fetchDailySalesNotification();
    const interval = setInterval(fetchDailySalesNotification, 3600000);
    return () => clearInterval(interval);
  }, []);

  const fetchDailySalesNotification = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/products/sales/daily`);
      if (!response.ok) return;

      const data = await response.json();
      const today = new Date().toLocaleDateString("fr-FR");
      
      const existingNotification = notifications.find((n) => n.date === today);

      if (!existingNotification && data.totalQuantitySold > 0) {
        const newNotification = {
          id: Date.now(),
          date: today,
          title: "Rapport de ventes",
          message: `Ventes du jour: ${data.totalQuantitySold} articles`,
          revenue: data.sales?.reduce((sum, sale) => sum + (sale.quantitySold * (sale.price || 0)), 0) || 0,
          read: false,
          timestamp: new Date().toISOString(),
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to fetch daily sales:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => {
      const notification = notifications.find((n) => n.id === id);
      return notification && !notification.read ? prev - 1 : prev;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        
        {/* Left Section */}
        <div className="flex flex-col">
          <h2 className="text-md sm:text-lg font-bold text-gray-800 tracking-tight">
            Bonjour, <span className="text-blue-600">{user.name}</span> 👋
          </h2>
          <p className="hidden sm:block text-[11px] uppercase tracking-wider font-medium text-gray-400">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-5">
          
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-all focus:outline-none"
            >
              <Bell size={20} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="px-5 py-4 flex items-center justify-between bg-gray-50/50 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Marquer tout lu
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b border-gray-50 flex gap-4 transition-colors ${!n.read ? "bg-blue-50/30" : "hover:bg-gray-50"}`}>
                          <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.read ? "bg-blue-500" : "bg-transparent"}`} />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-gray-800">{n.title}</h4>
                              <button onClick={() => deleteNotification(n.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                            {n.revenue > 0 && (
                              <div className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-[10px] font-bold">
                                + {n.revenue.toLocaleString("fr-FR")} FC
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-gray-400 font-medium">{new Date(n.timestamp).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
                                {!n.read && (
                                    <button onClick={() => markAsRead(n.id)} className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                        Lure <Check size={10} />
                                    </button>
                                )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <div className="inline-flex p-4 rounded-full bg-gray-50 mb-3">
                            <Bell size={32} className="text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400 font-medium">Aucune nouvelle notification</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Section */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-1 pr-3 py-1 bg-gray-50 rounded-full border border-gray-100 hover:border-blue-200 transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-800 truncate max-w-[100px]">{user.name}</p>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? "rotate-180 text-blue-600" : ""}`} />
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Session active</p>
                    <p className="font-bold truncate text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">{user.email}</p>
                  </div>
                  
                  <div className="p-2">
                    <ProfileMenuItem icon={<User size={16}/>} label="Mon Profil" onClick={() => navigate("/dashboard")} />
                    <ProfileMenuItem icon={<Settings size={16}/>} label="Paramètres" onClick={() => navigate("/settings")} />
                    <div className="h-px bg-gray-100 my-2 mx-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Sub-component for clean profile menu items
const ProfileMenuItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-semibold"
  >
    <span className="text-gray-400 group-hover:text-blue-600 transition-colors">{icon}</span>
    {label}
  </button>
);