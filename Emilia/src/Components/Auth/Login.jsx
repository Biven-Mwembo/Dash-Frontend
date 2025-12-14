import { useState } from "react";
import logo from "../../assets/dash.svg";
import PageWrapper from "../PageWrapper";
import API_BASE_URL from "../../apiConfig";

export default function Login() {
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
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {  // ✅ Fixed: Added /api/ to match backend route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setMessage("Connexion réussie ! Redirection...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else if (res.status === 401) {
        setMessage("Email ou mot de passe incorrect.");
      } else if (res.status === 500) {
        setMessage("Erreur serveur. Réessayez plus tard.");
      } else {
        setMessage(data?.message || "Échec de la connexion.");
      }
    } catch (err) {
      setMessage("Erreur réseau : " + err.message);
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
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Connexion</h2>
          {message && (
            <p className={`mb-4 text-center ${message.includes("réussie") ? "text-green-500" : "text-red-500"}`}>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 placeholder-gray-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
            {loading && <Spinner />}
          </form>
          <p className="text-center mt-4 text-gray-700">
            Pas de compte ?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">S'inscrire</a>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
