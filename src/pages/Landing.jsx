import React from "react";
import { Gauge, TrendingUp, BarChart3 } from "lucide-react";
import { Frame, Mark } from "../components/Frame";
import { KpiWidget, LineWidget, PieWidget, widgetDefs } from "../components/Widgets";
import ThemeToggle from "../components/ThemeToggle";
import "./Landing.css";

export default function Landing({ goTo }) {
  return (
    <div className="landing">
      <div className="masthead-accent" />
      <div className="landing-nav">
        <div className="landing-brand">
          <Mark />
          <span className="landing-brand-name">Lider Visualization App</span>
        </div>
        <div className="landing-nav-links">
          <span className="landing-nav-link" onClick={() => goTo("login")}>Log in</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <button className="btn btn-amber" onClick={() => goTo("signup")}>Get started</button>
        </div>
      </div>

      <div className="landing-hero">
        <div>
          <div className="landing-eyebrow">✦ RESTRUCTURED DATA VISUALIZATION ENGINE</div>
          <h1 className="landing-headline">
            Turn Any Dataset Into Interactive Visualizations & Shareable Dashboards.
          </h1>
          <p className="landing-subhead">
            Import CSV, Excel, or JSON files. Build real-time customizable charts with drill-downs, Smart BI stories, and instant read-only public sharing links.
          </p>
          <div className="landing-cta-row">
            <button className="btn btn-amber" onClick={() => goTo("signup")}>Start building</button>
            <button className="btn btn-ghost" onClick={() => goTo("login")}>Log in</button>
          </div>
        </div>

        <div className="landing-preview">
          <Frame><KpiWidget data={widgetDefs.kpi.make()} /></Frame>
          <div className="landing-preview-split">
            <Frame><LineWidget data={widgetDefs.line.make()} /></Frame>
            <Frame><PieWidget data={widgetDefs.pie.make()} /></Frame>
          </div>
        </div>
      </div>

      <div className="landing-features">
        <FeatureCard icon={Gauge} title="Any Data In Seconds" body="Import spreadsheets, tables, or pasted rows and map columns to your charts." />
        <FeatureCard icon={TrendingUp} title="Interactive & Live" body="Filter, drill down into categories, and generate Smart BI narrative stories with 1-click recommendations." />
        <FeatureCard icon={BarChart3} title="1-Click Public Sharing" body="Publish your dashboard as an interactive, read-only link for clients and third parties." />
      </div>

      <div className="landing-footer">
        <span>Lider Visualization App</span>
        <span>© 2026</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }) {
  return (
    <Frame>
      <Icon size={18} color="var(--amber)" />
      <div className="feature-title">{title}</div>
      <div className="feature-body">{body}</div>
    </Frame>
  );
}
