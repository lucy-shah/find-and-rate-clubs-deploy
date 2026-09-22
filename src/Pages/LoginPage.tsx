import { useState, type FormEvent } from "react";
import { authAPI } from "../api/client";
import type { User } from "../api/client";

type Props = {
  onNavigateHome: () => void;
  onNavigateSignup: () => void;
  onLoginSuccess: (user: User) => void;
};

export default function LoginPage({ onNavigateHome, onNavigateSignup, onLoginSuccess }: Props) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username || !password) {
      setError("Please enter a username and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.login(username, password);
      localStorage.setItem("rmc_auth", JSON.stringify(response));
      setSuccess("Logged in successfully.");
      onLoginSuccess(response);
    } catch (err) {
      // Prefer server-provided error detail when available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = err as any;
      const serverMsg = anyErr?.response?.data?.detail ?? anyErr?.message;
      setError(serverMsg ? String(serverMsg) : "Login failed. Check your username and password.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          background-color: #f6f6f6;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 26rem;
          background-color: #ffffff;
          border-radius: 1rem;
          padding: clamp(1.25rem, 5vw, 2rem);
          box-shadow: 0 1.5rem 3.75rem rgba(0, 0, 0, 0.12);
          box-sizing: border-box;
        }

        .login-nav {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .login-nav-btn {
          background: transparent;
          border: none;
          color: #111111;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 0;
          line-height: 1.5;
        }

        .login-nav-btn:hover {
          text-decoration: underline;
        }

        .login-title {
          font-size: clamp(1.4rem, 4vw, 1.8rem);
          margin: 0 0 0.5rem 0;
        }

        .login-subtitle {
          margin: 0 0 1.5rem 0;
          color: #555555;
          font-size: clamp(0.875rem, 2.5vw, 1rem);
        }

        .login-label {
          display: block;
          margin-bottom: 0.75rem;
        }

        .login-label:nth-child(2) {
          margin-bottom: 1rem;
        }

        .login-label-text {
          display: block;
          margin-bottom: 0.35rem;
          color: #333333;
          font-size: 0.9rem;
        }

        .login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.625rem;
          border: 1px solid #dddddd;
          font-size: 1rem;
          box-sizing: border-box;
          -webkit-appearance: none;
        }

        .login-input:focus {
          outline: 2px solid #111111;
          outline-offset: 1px;
          border-color: transparent;
        }

        .login-error {
          color: #b00020;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .login-success {
          color: #0a7b45;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .login-submit {
          width: 100%;
          padding: 0.85rem;
          border-radius: 999px;
          border: none;
          background-color: #111111;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          touch-action: manipulation;
        }

        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-submit:not(:disabled):hover {
          background-color: #333333;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-nav">
            <button onClick={onNavigateHome} className="login-nav-btn">
              Back to Home
            </button>
            <button onClick={onNavigateSignup} className="login-nav-btn">
              Create Account
            </button>
          </div>

          <h1 className="login-title">Log in</h1>
          <p className="login-subtitle">Access your ratings and reviews.</p>

          <form onSubmit={handleSubmit}>
            <label className="login-label">
              <span className="login-label-text">Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="yourusername"
                className="login-input"
                autoComplete="username"
              />
            </label>

            <label className="login-label">
              <span className="login-label-text">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="login-input"
                autoComplete="current-password"
              />
            </label>

            {error && <div className="login-error">{error}</div>}
            {success && <div className="login-success">{success}</div>}

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}