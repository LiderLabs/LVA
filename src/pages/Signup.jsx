import React, { useState } from "react";
import { Frame, Mark } from "../components/Frame";
import ThemeToggle from "../components/ThemeToggle";
import "./Auth.css";

export default function Signup({ goTo, onAuthenticated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Fill in every field to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Password should be at least 8 characters.");
      return;
    }
    setError("");
    onAuthenticated({ name, email });
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
            <div className="auth-title">Create your account</div>
            <div className="auth-subtitle">Start building your first dashboard.</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Blake" />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
              </div>
              <div className="field">
                <label className="label">Password</label>
                <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="btn btn-amber btn-block">Create account</button>
            </form>

            <div className="auth-switch">
              Already have an account?{" "}
              <span className="auth-switch-link" onClick={() => goTo("login")}>Log in</span>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
