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

  // --- Logic (Unchanged) ---
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
      const n = notifications.find((item) => item.id === id);
      return n && !n.read ? prev - 1 : prev;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm h-16 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        
        {/* Left Side: Logo or Brand (Placeholder) */}
        <div className="flex items-center">
          <div className="text-xl font-black text-blue-600 tracking-tighter cursor-pointer" onClick={() => navigate("/")}>
            DASHBOARD
          </div>
        </div>

        {/* Right Side: Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Notification Button */}
          <div className="relative" ref={notificationRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all focus:outline-none flex items-center justify-center shadow-sm"
            >
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              )}
            </motion.button>

            {/* Notification Modal - Responsive Fix */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-3 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
                >
                  <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">
                        Tout marquer
                      </button>
                    )}
                  </div>

                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-4 border-b border-gray-50 flex gap-3 transition-colors ${!n.read ? "bg-blue-50/20" : "hover:bg-gray-50"}`}>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-gray-800">{n.title}</h4>
                              <button onClick={() => deleteNotification(n.id)} className="text-gray-300 hover:text-red-500">
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-[10px] text-gray-400 font-medium">{new Date(n.timestamp).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
                              {!n.read && (
                                <button onClick={() => markAsRead(n.id)} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-blue-100 shadow-sm">
                                  Lu <Check size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-gray-400">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-medium">Aucune notification</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white border border-gray-200 hover:border-blue-500 transition-all shadow-sm focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-blue-600">
                <User size={18} strokeWidth={2.5} />
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
                >
                  <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                    <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate font-medium uppercase tracking-tight">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => {navigate("/dashboard"); setShowProfileMenu(false);}} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all font-semibold">
                      <User size={16}/> Mon Profil
                    </button>
                    <button onClick={() => {navigate("/settings"); setShowProfileMenu(false);}} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all font-semibold">
                      <Settings size={16}/> Paramètres
                    </button>
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all font-bold">
                      <LogOut size={16} /> Déconnexion
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