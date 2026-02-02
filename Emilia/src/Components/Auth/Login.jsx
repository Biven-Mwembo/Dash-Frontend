import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/dash.svg";
import PageWrapper from "../PageWrapper";
import API_BASE_URL from "../../apiConfig";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.Message || data.message || "Login failed");
      }

      // ✅ Match C# casing: data.Token or data.token
      const token = data.token || data.Token;
      localStorage.setItem("token", token);

      setMessage("Connexion réussie ! Redirection...");

      // ✅ Decode JWT to get user role
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userRole = payload.role || "user";

        setTimeout(() => {
          // ✅ Redirect based on role
          if (userRole === "admin") {
            navigate("/ventes"); // Admin goes to Ventes (Sales)
          } else {
            navigate("/produits"); // Regular user goes to Products
          }
        }, 1000);
      } catch (decodeError) {
        // ✅ Fallback if token decode fails
        setTimeout(() => {
          navigate("/produits");
        }, 1000);
      }
    } catch (err) {
      setMessage("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const Spinner = () => (
    <div className="flex justify-center my-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Logo" className="w-32 h-auto object-contain" />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Connexion
          </h2>
          {message && (
            <p
              className={`mb-4 text-center font-medium ${
                message.includes("réussie") ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
              required
              autoComplete="email"
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
            {loading && <Spinner />}
          </form>
          <p className="text-center mt-4 text-gray-700">
            Pas de compte ?{" "}
            <a href="/signup" className="text-blue-600 hover:underline font-medium">
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}