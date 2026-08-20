import React, { useState, useMemo } from "react";
import {
  Plus, FolderKanban, Pencil, Trash2, X, LogOut, Lightbulb,
  ArrowRight, MoreVertical, CheckCircle2, Clock, Calendar, Filter, ChevronRight,
} from "lucide-react";
import { Mark } from "../components/Frame";
import ThemeToggle from "../components/ThemeToggle";
import * as projectStore from "../utils/projectStorage";
import "./ProjectsHome.css";

export default function ProjectsHome({ user, goTo, onOpenProject }) {
  const [projects, setProjects] = useState(() => projectStore.listProjects());
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeInsightId, setActiveInsightId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showTimelineDrawer, setShowTimelineDrawer] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState("all");
  const [timelineGrouping, setTimelineGrouping] = useState("month");

  function refresh() {
    setProjects(projectStore.listProjects());
  }

  function handleCreate(name) {
    if (!name.trim()) return;
    const newProj = { name: name.trim(), status: "ongoing", createdAt: Date.now() };
    const id = projectStore.saveProject(newProj);
    refresh();
    setShowCreate(false);
    onOpenProject({ id, ...newProj });
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this project permanently?")) return;
    projectStore.deleteProject(id);
    setActiveInsightId(null);
    setActiveMenuId(null);
    refresh();
  }

  function handleRename(id, name) {
    projectStore.renameProject(id, name);
    refresh();
    setEditingId(null);
  }

  function handleStatusChange(id, status) {
    projectStore.updateProjectStatus(id, status);
    setActiveMenuId(null);
    refresh();
  }

  const groupedProjects = useMemo(() => {
    let filtered = projects;
    if (timelineFilter !== "all") {
      filtered = filtered.filter((p) => p.status === timelineFilter);
    }

    const groups = {};
    filtered.forEach((p) => {
      const date = new Date(p.completedAt || p.updatedAt || p.createdAt || Date.now());
      let groupKey = "";

      if (timelineGrouping === "year") {
        groupKey = date.getFullYear().toString();
      } else if (timelineGrouping === "week") {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        groupKey = `Week ${weekNum}, ${date.getFullYear()}`;
      } else {
        groupKey = date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(p);
    });

    return Object.entries(groups);
  }, [projects, timelineFilter, timelineGrouping]);

  return (
    <div
      className="projects-page"
      onClick={() => {
        setActiveInsightId(null);
        setActiveMenuId(null);
      }}
    >
      <div className="masthead-accent" />

      <div className="projects-nav">
        <div className="projects-nav-brand">
          <Mark />
          <span className="projects-nav-title">Projects</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="btn btn-ghost"
            onClick={(e) => {
              e.stopPropagation();
              setShowTimelineDrawer(true);
            }}
            title="Project Timeline & Status"
          >
            <Filter size={13} className="icon-leading" />
            Project Manager
          </button>
          <ThemeToggle />
          <button className="btn btn-ghost" onClick={() => goTo("login")}>
            <LogOut size={13} className="icon-leading" />
            Log out
          </button>
        </div>
      </div>

      <div className="projects-body">
        <div className="projects-header-row">
          <div className="projects-heading">Your Data Projects</div>
        </div>
        <div className="projects-subhead">
          Each workspace manages its own isolated datasets, real-time visualizations, and reports.
        </div>

        <div className="projects-grid">
          {projects.map((p) => {
            const dash = projectStore.loadProjectDashboard(p.id);
            const isEmpty = !dash || !dash.widgets || dash.widgets.length === 0;
            const lastSavedText = dash?.savedAt
              ? projectStore.formatGhanaDateTime(dash.savedAt)
              : projectStore.formatGhanaDateTime(p.createdAt);

            return (
              <div key={p.id} className="project-card frame" onClick={() => onOpenProject(p)}>
                <div className="project-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-icon"
                    onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                    title="Project Options"
                  >
                    <MoreVertical size={12} />
                  </button>

                  {activeMenuId === p.id && (
                    <div className="project-menu-popover">
                      <button
                        className="project-menu-item"
                        onClick={() => handleStatusChange(p.id, p.status === "completed" ? "ongoing" : "completed")}
                      >
                        <CheckCircle2 size={12} color={p.status === "completed" ? "var(--good)" : "var(--text-muted)"} />
                        <span>{p.status === "completed" ? "Mark as In Progress" : "Mark as Completed"}</span>
                      </button>
                      <button className="project-menu-item" onClick={() => { setEditingId(p.id); setActiveMenuId(null); }}>
                        <Pencil size={12} />
                        <span>Rename Project</span>
                      </button>
                      <button className="project-menu-item item-danger" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={12} />
                        <span>Delete Project</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="project-card-top">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className={`project-type-badge ${p.status === "completed" ? "completed" : ""}`}>
                      {p.status === "completed" ? <CheckCircle2 size={10} className="icon-leading" /> : <Clock size={10} className="icon-leading" />}
                      {p.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                  </div>

                  <button
                    className="project-insight-trigger-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInsightId(activeInsightId === p.id ? null : p.id);
                    }}
                    title="Project Details & Insights"
                  >
                    <Lightbulb size={13} color="var(--amber)" />
                  </button>
                </div>

                {activeInsightId === p.id && (
                  <div className="project-insight-popover" onClick={(e) => e.stopPropagation()}>
                    <div className="project-insight-header">
                      <Lightbulb size={14} color="var(--amber)" />
                      <span>Project Information</span>
                    </div>

                    {isEmpty ? (
                      <>
                        <div className="project-insight-text">
                          You have an empty workspace in this project. Would you like to continue from where you left off or remove this project?
                        </div>
                        <div className="project-insight-actions">
                          <button className="btn btn-ghost btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                            <Trash2 size={11} className="icon-leading" /> Delete Project
                          </button>
                          <button className="btn btn-amber btn-sm" onClick={() => onOpenProject(p)}>
                            <ArrowRight size={11} className="icon-leading" /> Continue Working
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="project-insight-text">
                          Last saved: <strong>{lastSavedText}</strong>
                        </div>
                        <div className="project-insight-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => setActiveInsightId(null)}>
                            Attend to it later
                          </button>
                          <button className="btn btn-amber btn-sm" onClick={() => onOpenProject(p)}>
                            <ArrowRight size={11} className="icon-leading" /> Proceed to make updates
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {editingId === p.id ? (
                  <input
                    className="input"
                    defaultValue={p.name}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => handleRename(p.id, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(p.id, e.target.value)}
                  />
                ) : (
                  <div className="project-name">{p.name}</div>
                )}
                <div className="project-meta">
                  {isEmpty ? "Empty workspace - click to build" : `${dash?.widgets?.length || 0} charts - last saved ${lastSavedText}`}
                </div>
              </div>
            );
          })}

          <div className="project-new-card" onClick={() => setShowCreate(true)}>
            <Plus size={22} />
            <span>Create New Project</span>
          </div>
        </div>
      </div>

      {showTimelineDrawer && (
        <>
          <div className="projects-drawer-backdrop" onClick={() => setShowTimelineDrawer(false)} />
          <div className="project-timeline-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="timeline-drawer-header">
              <div>
                <div className="timeline-drawer-title">Project Manager</div>
                <div className="timeline-drawer-sub">Status, milestones, and timeline tracker</div>
              </div>
              <button className="btn-icon" onClick={() => setShowTimelineDrawer(false)}>
                <X size={14} />
              </button>
            </div>

            <div className="timeline-filter-tabs">
              <button
                className={`timeline-tab ${timelineFilter === "all" ? "active" : ""}`}
                onClick={() => setTimelineFilter("all")}
              >
                All ({projects.length})
              </button>
              <button
                className={`timeline-tab ${timelineFilter === "completed" ? "active" : ""}`}
                onClick={() => setTimelineFilter("completed")}
              >
                Completed ({projects.filter((x) => x.status === "completed").length})
              </button>
              <button
                className={`timeline-tab ${timelineFilter === "ongoing" ? "active" : ""}`}
                onClick={() => setTimelineFilter("ongoing")}
              >
                In Progress ({projects.filter((x) => x.status !== "completed").length})
              </button>
            </div>

            <div className="timeline-group-row">
              <span className="timeline-group-label">Group by:</span>
              <div className="timeline-group-btns">
                <button
                  className={`timeline-group-btn ${timelineGrouping === "month" ? "active" : ""}`}
                  onClick={() => setTimelineGrouping("month")}
                >
                  Month
                </button>
                <button
                  className={`timeline-group-btn ${timelineGrouping === "week" ? "active" : ""}`}
                  onClick={() => setTimelineGrouping("week")}
                >
                  Week
                </button>
                <button
                  className={`timeline-group-btn ${timelineGrouping === "year" ? "active" : ""}`}
                  onClick={() => setTimelineGrouping("year")}
                >
                  Year
                </button>
              </div>
            </div>

            <div className="timeline-list-container">
              {groupedProjects.length === 0 ? (
                <div className="timeline-empty">No projects found in this category.</div>
              ) : (
                groupedProjects.map(([groupName, items]) => (
                  <div key={groupName} className="timeline-group-block">
                    <div className="timeline-group-heading">
                      <Calendar size={11} className="icon-leading" />
                      {groupName} ({items.length})
                    </div>

                    <div className="timeline-group-items">
                      {items.map((p) => (
                        <div
                          key={p.id}
                          className="timeline-item-card"
                          onClick={() => {
                            setShowTimelineDrawer(false);
                            onOpenProject(p);
                          }}
                        >
                          <div className="timeline-item-left">
                            <div className="timeline-item-name">{p.name}</div>
                            <div className="timeline-item-date">
                              {p.status === "completed"
                                ? `Completed: ${projectStore.formatGhanaDateTime(p.completedAt)}`
                                : `Updated: ${projectStore.formatGhanaDateTime(p.updatedAt || p.createdAt)}`}
                            </div>
                          </div>
                          <div className="timeline-item-right">
                            <span className={`timeline-item-pill ${p.status === "completed" ? "good" : "warn"}`}>
                              {p.status === "completed" ? "Completed" : "In Progress"}
                            </span>
                            <ChevronRight size={14} color="var(--text-muted)" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {showCreate && <CreateSimpleProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}

function CreateSimpleProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-panel" onClick={(e) => e.stopPropagation()} style={{ width: 440 }}>
        <div className="import-panel-header">
          <div className="import-title">New Data Project</div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="import-subtitle">Give your project a name to begin building visualizations.</div>

        <div className="field">
          <label className="label">Project Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q4 Sales Performance"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && onCreate(name)}
          />
        </div>

        <div className="import-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-amber" disabled={!name.trim()} onClick={() => onCreate(name)}>
            Create & Open
          </button>
        </div>
      </div>
    </div>
  );
}