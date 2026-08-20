import React from "react";
import { ArrowLeft, Plus, BarChart3, Database, LayoutDashboard } from "lucide-react";
import { Mark } from "../components/Frame";
import ThemeToggle from "../components/ThemeToggle";
import "./ProjectDetail.css";

export default function ProjectDetail({ project, goTo, onOpenDashboard }) {
  return (
    <div className="project-detail-page">
      <div className="masthead-accent" />
      <div className="project-detail-nav">
        <div className="project-detail-left">
          <button className="btn-icon" onClick={() => goTo("projects")} title="Back to all projects">
            <ArrowLeft size={14} />
          </button>
          <Mark size={16} />
          <span className="project-detail-name">{project?.name || "Project Overview"}</span>
        </div>
        <div className="project-detail-right">
          <ThemeToggle />
          <button className="btn btn-ghost" onClick={() => goTo("projects")}>My Projects</button>
        </div>
      </div>

      <div className="project-detail-center">
        <div className="project-detail-card">
          <div className="project-badge-tag">PROJECT WORKSPACE</div>
          <h1 className="project-detail-title">{project?.name || "Your Project"}</h1>
          <p className="project-detail-desc">
            Import your spreadsheets, tables, or datasets and build real-time interactive charts with automated BI stories.
          </p>
          <div className="project-action-box">
            <button className="btn btn-amber btn-lg project-create-btn" onClick={onOpenDashboard}>
              <Plus size={18} className="icon-leading" />
              Create your dashboard
            </button>
          </div>
          <div className="project-feature-pills">
            <span className="project-pill"><Database size={12} className="icon-leading" /> Any CSV / Excel / JSON</span>
            <span className="project-pill"><BarChart3 size={12} className="icon-leading" /> 10+ Visualizations</span>
            <span className="project-pill"><LayoutDashboard size={12} className="icon-leading" /> 1-Click Shareable Links</span>
          </div>
        </div>
      </div>
    </div>
  );
}
