// ✅ Central API URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://dash-backend-1-60mf.onrender.com";

export default API_BASE_URL;

/**
 * ✅ Helper function to make authenticated API calls
 */
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.warn("⚠️ No authentication token found");
    localStorage.removeItem("token");
    window.location.href = "/login"; 
    throw new Error("No authentication token");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      console.error("❌ 401 Unauthorized - Session expired");
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    return response;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    throw error;
  }
};

export const isAuthenticated = () => !!localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};