// src/apiConfig.js

// ✅ Central API URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://dash-backend-1-60mf.onrender.com/api";

export default API_BASE_URL;

/**
 * ✅ Helper function to make authenticated API calls
 * Automatically handles:
 * - Adding Authorization header
 * - 401 Unauthorized responses (redirects to login)
 * - Token validation
 */
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  // If no token, redirect to login
  if (!token) {
    console.warn("⚠️ No authentication token found, redirecting to login");
    localStorage.removeItem("token");
    window.location.href = "/";
    throw new Error("No authentication token");
  }

  // Merge headers with Authorization
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      console.error("❌ 401 Unauthorized - Session expired");
      localStorage.removeItem("token");
      window.location.href = "/";
      throw new Error("Session expired. Please login again.");
    }

    return response;
  } catch (error) {
    // Network errors or other fetch failures
    if (error.message === "Session expired. Please login again.") {
      throw error;
    }
    console.error("❌ Fetch error:", error);
    throw new Error(`Network error: ${error.message}`);
  }
};

/**
 * ✅ Helper to check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

/**
 * ✅ Helper to logout user
 */
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};

/**
 * ✅ Helper to get current token
 */
export const getToken = () => {
  return localStorage.getItem("token");
};