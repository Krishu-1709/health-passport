import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_role", data.role);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-brand">
        <div className="login-brand-mark">+</div>

        <div>
          <h1>Health Passport</h1>
          <p>Rural Healthcare Platform</p>
        </div>
      </div>

      <section className="login-card">
        <div className="login-card-header">
          <span className="login-eyebrow">HEALTHCARE ACCESS</span>

          <h2>Welcome back</h2>

          <p>
            Sign in to access patient health records.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="doctor@demo.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="demo-access">
          <div className="demo-access-title">
            Demo Access
          </div>

          <div className="demo-credentials">
            <div>
              <span>Doctor ID</span>
              <strong>doctor@demo.com</strong>
            </div>

            <div>
              <span>Password</span>
              <strong>demo123</strong>
            </div>
          </div>

          <p>
            These credentials are provided for demonstration purposes
            only to show that the login system is working.
          </p>
        </div>

        <div className="login-footer">
          <span className="login-status-dot"></span>
          <span>Secure access to healthcare records</span>
        </div>
      </section>

      <p className="login-description">
        Offline-first healthcare records designed for communities
        where reliable internet access isn't always available.
      </p>
    </main>
  );
}

export default Login;