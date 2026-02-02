import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import User from "./Components/User";
import Produits from "./Pages/Produits";
import Ventes from "./Pages/Ventes";
import Fournisseurs from "./Pages/Fournisseurs";
import Utilisateurs from "./Pages/Utilisateurs";
import PageLayout from "./Components/PageLayout";

// ✅ Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        return <Navigate to="/produits" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Always redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Dashboard-style routes (with sidebar + navbar) */}
        <Route element={<PageLayout />}>
          {/* ✅ Admin-only routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventes"
            element={
              <ProtectedRoute adminOnly>
                <Ventes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fournisseurs"
            element={
              <ProtectedRoute adminOnly>
                <Fournisseurs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/utilisateurs"
            element={
              <ProtectedRoute adminOnly>
                <Utilisateurs />
              </ProtectedRoute>
            }
          />

          {/* ✅ Available to all authenticated users */}
          <Route
            path="/produits"
            element={
              <ProtectedRoute>
                <Produits />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}