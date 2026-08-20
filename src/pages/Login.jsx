import React, { useState } from "react";
import { Frame, Mark } from "../components/Frame";
import ThemeToggle from "../components/ThemeToggle";
import "./Auth.css";

export default function Login({ goTo, onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError("");
    // No real backend is wired up yet — this just moves the user forward.
    onAuthenticated({ email });
  }

  return (
    <div className="auth-page">
      <div className="masthead-accent" />
      <div className="auth-nav">
        <div className="auth-nav-brand" onClick={() => goTo("landing")}>
          <Mark />
        </div>
        <ThemeToggle />
      </div>

      <div className="auth-center">
        <div className="auth-card">
          <Frame>
            <div className="auth-title">Welcome back</div>
            <div className="auth-subtitle">Log in to your dashboards.</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
              <div className="field">
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="btn btn-amber btn-block">Log in</button>
            </form>

            <div className="auth-switch">
              No account yet?{" "}
              <span className="auth-switch-link" onClick={() => goTo("signup")}>Create one</span>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
