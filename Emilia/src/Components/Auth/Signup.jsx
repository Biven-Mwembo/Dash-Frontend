import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import PageWrapper from "../PageWrapper";
import API_BASE_URL from "../../apiConfig";

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    surname: "",
  });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("Compte créé ! Redirection vers la page de connexion...");
        setForm({ email: "", password: "", name: "", surname: "" });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setIsSuccess(false);
        setMessage(data?.Message || data?.message || "L'inscription a échoué");
      }
    } catch (err) {
      setIsSuccess(false);
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
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">S'inscrire</h2>

          {message && (
            <p className={`mb-4 text-center ${isSuccess ? "text-green-600" : "text-red-500"}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Prénom"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="surname"
                placeholder="Nom"
                value={form.surname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Création du compte..." : "S'inscrire"}
            </button>
            {loading && <Spinner />}
          </form>

          <p className="text-center mt-4 text-gray-700">
            Déjà un compte ? <a href="/login" className="text-blue-600 hover:underline">Connexion</a>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}