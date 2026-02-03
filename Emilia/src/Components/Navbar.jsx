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

  // ✅ Get user info from JWT
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

  // ✅ Fetch daily sales notification
  useEffect(() => {
    fetchDailySalesNotification();
    
    // Check for new notifications every hour
    const interval = setInterval(fetchDailySalesNotification, 3600000);
    return () => clearInterval(interval);
  }, []);

  const fetchDailySalesNotification = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/products/sales/daily`);
      if (!response.ok) return;

      const data = await response.json();
      const today = new Date().toLocaleDateString("fr-FR");
      
      // Check if we already have today's notification
      const existingNotification = notifications.find(
        (n) => n.date === today
      );

      if (!existingNotification && data.totalQuantitySold > 0) {
        const newNotification = {
          id: Date.now(),
          date: today,
          title: "Rapport de ventes du jour",
          message: `Vous avez vendu ${data.totalQuantitySold} articles aujourd'hui`,
          revenue: data.sales?.reduce((sum, sale) => {
            return sum + (sale.quantitySold * (sale.price || 0));
          }, 0) || 0,
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

  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center py-3 px-4 sm:px-6">
        {/* Left Section - Welcome Message */}
        <div className="hidden md:block">
          <h2 className="text-lg font-semibold text-gray-900">
            Bonjour, {user.name}! 👋
          </h2>
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Mobile - Just name */}
        <div className="md:hidden">
          <h2 className="text-base font-semibold text-gray-900">
            {user.name}
          </h2>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell */}
          <div className="relative bg-white text-gray-900" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Notifications"
            >
              <Bell size={22} className="text-gray-900 bg-white" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-gray-900">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              {notification.revenue > 0 && (
                                <p className="text-xs font-semibold text-green-600">
                                  Revenu: FC{" "}
                                  {notification.revenue.toLocaleString("fr-FR")}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  notification.timestamp
                                ).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                                  title="Marquer comme lu"
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                                title="Supprimer"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-white text-gray-900">
                        <Bell
                          size={48}
                          className="mx-auto text-gray-300 mb-3"
                        />
                        <p className="text-gray-500 text-sm">
                          Aucune notification
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base ring-2 ring-white shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* User Info - Hidden on mobile */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {user.email}
                </p>
              </div>

              {/* Dropdown Icon */}
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform hidden sm:block ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                >
                  {/* User Info Header */}
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/50">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-blue-100">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition"
                    >
                      <User size={18} />
                      Mon Profil
                    </button>
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition"
                    >
                      <Settings size={18} />
                      Paramètres
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                    >
                      <LogOut size={18} />
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