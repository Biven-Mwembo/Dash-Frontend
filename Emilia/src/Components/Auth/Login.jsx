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
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard"; 
      } else {
        setMessage(data?.Message || data?.message || "Login failed");
      }
    } catch (err) {
      setMessage("Login failed: " + err.message);
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
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
          {message && <p className="mb-4 text-center text-red-500">{message}</p>}
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
              placeholder="Password"
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
              {loading ? "Logging in..." : "Login"}
            </button>
            {loading && <Spinner />}
          </form>
          <p className="text-center mt-4 text-gray-700">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">Sign Up</a>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}