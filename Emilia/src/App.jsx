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
import Utilisateurs from "./Pages/Utilisateurs"; // ✅ This is now the User Management page
import PageLayout from "./Components/PageLayout";

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
          <Route path="/dashboard" element={<User />} />
          <Route path="/produits" element={<Produits />} />
          <Route path="/ventes" element={<Ventes />} />
          <Route path="/fournisseurs" element={<Fournisseurs />} />
          {/* ✅ User Management page (Admin only) */}
          <Route path="/utilisateurs" element={<Utilisateurs />} />
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