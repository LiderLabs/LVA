import React from "react";

// React's error boundaries only work as class components -- there's
// no hook equivalent for this. This is the one exception to the
// function-component pattern used everywhere else in this project.
//
// Without something like this, ANY uncaught error thrown during
// render anywhere in the app (a bad formula, a malformed import, a
// typo in a chart) unmounts the entire React tree and leaves a blank
// white page, forcing a full refresh back to the landing page and
// losing anything not yet autosaved. This catches that instead.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Something went wrong." };
  }

  componentDidCatch(error, info) {
    console.error("Caught by ErrorBoundary:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={errorStyles.wrap}>
          <div style={errorStyles.card}>
            <div style={errorStyles.title}>Something went wrong</div>
            <div style={errorStyles.message}>{this.state.message}</div>
            <div style={errorStyles.hint}>
              Your work up to a moment ago is safe — the dashboard autosaves continuously. Try again below.
            </div>
            <button style={errorStyles.button} onClick={this.handleReset}>Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Plain inline styles rather than a CSS file: this component has to
// survive rendering even if something upstream (like CSS variables)
// is part of what broke.
const errorStyles = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", fontFamily: "-apple-system, sans-serif" },
  card: { maxWidth: 420, padding: 28, background: "#141414", border: "1px solid #333", borderRadius: 6, color: "#eee" },
  title: { fontSize: 18, fontWeight: 600, marginBottom: 10 },
  message: { fontSize: 13, color: "#bbb", marginBottom: 14, fontFamily: "monospace" },
  hint: { fontSize: 12.5, color: "#888", marginBottom: 18, lineHeight: 1.5 },
  button: { padding: "9px 18px", background: "#ff9f0a", border: "none", borderRadius: 3, color: "#150c00", fontWeight: 600, cursor: "pointer" },
};
