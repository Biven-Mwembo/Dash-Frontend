import React, { useState, useEffect, useRef } from "react";
import { Bell, User, ChevronDown, LogOut, Settings, X } from "lucide-react";
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
      } catch {
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

      const exists = notifications.find(n => n.date === today);
      if (!exists && data.totalQuantitySold > 0) {
        setNotifications(prev => [
          {
            id: Date.now(),
            date: today,
            title: "Rapport de ventes",
            message: `Vous avez vendu ${data.totalQuantitySold} articles aujourd'hui`,
            revenue:
              data.sales?.reduce(
                (sum, sale) => sum + sale.quantitySold * (sale.price || 0),
                0
              ) || 0,
            read: false,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
        setUnreadCount(c => c + 1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target))
        setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAsRead = (id) => {
    setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const markAllAsRead = () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    const notif = notifications.find(n => n.id === id);
    setNotifications(n => n.filter(x => x.id !== id));
    if (notif && !notif.read) setUnreadCount(c => c - 1);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left */}
        <div className="hidden md:block">
          <p className="text-sm text-gray-500">Bonjour</p>
          <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative p-2 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-3 w-[90vw] sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="px-4 py-3 flex justify-between items-center border-b">
                    <span className="font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600"
                      >
                        Tout lire
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center text-gray-400">
                        <Bell className="mx-auto mb-2" />
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b hover:bg-gray-50 ${
                            !n.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="flex justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{n.title}</p>
                              <p className="text-sm text-gray-600">{n.message}</p>
                              {n.revenue > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  FC {n.revenue.toLocaleString("fr-FR")}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              {!n.read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="p-1 hover:bg-blue-100 rounded"
                                >
                                  ✓
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(n.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(v => !v)}
              className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1.5"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {user.name[0]}
              </div>
              <ChevronDown
                size={16}
                className={`hidden sm:block transition ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="menu-item"
                    >
                      <User size={16} /> Profil
                    </button>
                    <button
                      onClick={() => navigate("/settings")}
                      className="menu-item"
                    >
                      <Settings size={16} /> Paramètres
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="menu-item text-red-600 hover:bg-red-50"
                    >
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
