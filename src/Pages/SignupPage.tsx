import { useState, type FormEvent } from "react";
import { authAPI } from "../api/client";

type Props = {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
};

export default function SignupPage({ onNavigateHome, onNavigateLogin }: Props) {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !username || !password) {
      setError("Please fill out all fields.");
      return;
    }

    // Client-side password strength check to give immediate feedback
    const pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
    if (!pwPattern.test(password)) {
      setError(
        "Password must be at least 10 characters and include uppercase, lowercase, a number, and a symbol."
      );
      return;
    }

    try {
      setLoading(true);
      await authAPI.register(email, username, password, isStudent);
      setSuccess("Account created. You can log in now.");
    } catch (err) {
      // Try to show server-provided message when available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = err as any;
      const serverMsg = anyErr?.response?.data?.detail ?? anyErr?.message;
      setError(serverMsg ? String(serverMsg) : "Sign up failed. Try a different email or username.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .signup-page {
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

        .signup-card {
          width: 100%;
          max-width: 27.5rem;
          background-color: #ffffff;
          border-radius: 1rem;
          padding: clamp(1.25rem, 5vw, 2rem);
          box-shadow: 0 1.5rem 3.75rem rgba(0, 0, 0, 0.12);
          box-sizing: border-box;
        }

        .signup-nav {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .signup-nav-btn {
          background: transparent;
          border: none;
          color: #111111;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 0;
          line-height: 1.5;
        }

        .signup-nav-btn:hover {
          text-decoration: underline;
        }

        .signup-title {
          font-size: clamp(1.4rem, 4vw, 1.8rem);
          margin: 0 0 0.5rem 0;
        }

        .signup-subtitle {
          margin: 0 0 1.5rem 0;
          color: #555555;
          font-size: clamp(0.875rem, 2.5vw, 1rem);
        }

        .signup-label {
          display: block;
          margin-bottom: 0.75rem;
        }

        .signup-label-text {
          display: block;
          margin-bottom: 0.35rem;
          color: #333333;
          font-size: 0.9rem;
        }

        .signup-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.625rem;
          border: 1px solid #dddddd;
          font-size: 1rem;
          box-sizing: border-box;
          -webkit-appearance: none;
        }

        .signup-input:focus {
          outline: 2px solid #111111;
          outline-offset: 1px;
          border-color: transparent;
        }

        .signup-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          cursor: pointer;
        }

        .signup-checkbox-label input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
          flex-shrink: 0;
        }

        .signup-error {
          color: #b00020;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .signup-success {
          color: #0a7b45;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .signup-submit {
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

        .signup-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-submit:not(:disabled):hover {
          background-color: #333333;
        }
      `}</style>

      <div className="signup-page">
        <div className="signup-card">
          <div className="signup-nav">
            <button onClick={onNavigateHome} className="signup-nav-btn">
              Back to Home
            </button>
            <button onClick={onNavigateLogin} className="signup-nav-btn">
              Log in
            </button>
          </div>

          <h1 className="signup-title">Create account</h1>
          <p className="signup-subtitle">Join the community and share reviews.</p>

          <form onSubmit={handleSubmit}>
            <label className="signup-label">
              <span className="signup-label-text">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@northeastern.edu"
                className="signup-input"
                autoComplete="email"
              />
            </label>

            <label className="signup-label">
              <span className="signup-label-text">Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="yourusername"
                className="signup-input"
                autoComplete="username"
              />
            </label>

            <label className="signup-label">
              <span className="signup-label-text">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="signup-input"
                autoComplete="new-password"
              />
            </label>

            <label className="signup-checkbox-label">
              <input
                type="checkbox"
                checked={isStudent}
                onChange={(event) => setIsStudent(event.target.checked)}
              />
              Northeastern student
            </label>

            {error && <div className="signup-error">{error}</div>}
            {success && <div className="signup-success">{success}</div>}

            <button type="submit" disabled={loading} className="signup-submit">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}