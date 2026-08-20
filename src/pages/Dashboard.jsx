import React, { useState, useMemo, useRef, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Settings2, LogOut, DownloadCloud, ImageDown, FileDown, Download,
  Maximize, Minimize, Maximize2, Save, Eye, FolderKanban,
  Share2, Check, ArrowLeft, Mail, GripVertical, CheckCircle2, Trash2, AlertCircle, Table2,
  FileSpreadsheet, Play, HelpCircle, Layers, Lightbulb,
} from "lucide-react";
import { Frame, Eyebrow, Mark } from "../components/Frame";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { widgetDefs, genericLabels, renderers } from "../components/Widgets";
import DataImportPanel from "../components/DataImportPanel";
import DrillDownModal from "../components/DrillDownModal";
import PaletteChoiceModal from "../components/PaletteChoiceModal";
import { remapMapping, mapperFor } from "../utils/dataImport";
import { exportCanvasAsPng, exportCanvasAsPdf, exportWidgetDataAsCsv, exportWidgetAsPng } from "../utils/exportUtils";
import { generateShareUrl } from "../utils/shareUtils";
import { saveProjectDashboard, loadProjectDashboard, deleteProject } from "../utils/projectStorage";
import DatasetViewModal from "../components/DatasetViewModal";
import "./Dashboard.css";

const ReactGridLayout = WidthProvider(Responsive);
const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const SPRING = { type: "spring", stiffness: 350, damping: 28 };

function defaultSize(type) {
  if (type === "kpi") return { w: 12, h: 3 };
  if (type === "scoreboard") return { w: 12, h: 4 };
  if (type === "scorecard") return { w: 6, h: 5 };
  if (type === "table") return { w: 6, h: 6 };
  return { w: 6, h: 8 };
}

function findFreeSlot(layout, w, h, cols = 12) {
  const occupied = new Set();
  layout.forEach((item) => {
    for (let yy = item.y; yy < item.y + item.h; yy++) {
      for (let xx = item.x; xx < item.x + item.w; xx++) {
        occupied.add(xx + "," + yy);
      }
    }
  });
  const maxY = layout.reduce((m, item) => Math.max(m, item.y + item.h), 0);
  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= cols - w; x++) {
      let fits = true;
      for (let yy = y; yy < y + h && fits; yy++) {
        for (let xx = x; xx < x + w; xx++) {
          if (occupied.has(xx + "," + yy)) { fits = false; break; }
        }
      }
      if (fits) return { x, y };
    }
  }
  return { x: 0, y: maxY };
}

export default function Dashboard({ user, goTo, project }) {
  const { theme, toggleTheme } = useTheme();

  const initialDashboard = useMemo(() => {
    if (project?.id) {
      return loadProjectDashboard(project.id);
    }
    return null;
  }, [project?.id]);

  const [widgets, setWidgets] = useState(() => initialDashboard?.widgets || []);
  const [layout, setLayout] = useState(() => initialDashboard?.layout || []);
  const [datasets, setDatasets] = useState(() => initialDashboard?.datasets || []);
  const [dashboardName, setDashboardName] = useState(() => initialDashboard?.name || (project ? (project.name + " Dashboard") : "Executive Dashboard"));

  const [selectedId, setSelectedId] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [paletteChoiceType, setPaletteChoiceType] = useState(null);
  const [importReuseContext, setImportReuseContext] = useState(null);
  const [drillDown, setDrillDown] = useState(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [widgetDownloadMenuId, setWidgetDownloadMenuId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);
  const [viewingDatasetId, setViewingDatasetId] = useState(null);

  const [isDirty, setIsDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const [presenting, setPresenting] = useState(false);
  const [presentFocusId, setPresentFocusId] = useState(null);
  const [presentationOrder, setPresentationOrder] = useState(null);
  const dragThumbRef = useRef(null);
  const [expandedWidgetId, setExpandedWidgetId] = useState(null);

  const pageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const selected = useMemo(() => widgets.find((w) => w.id === selectedId), [widgets, selectedId]);
  const isWorkspaceEmpty = widgets.length === 0 && datasets.length === 0;

  function handleSaveClick() {
    if (project?.id) {
      saveProjectDashboard(project.id, { name: dashboardName, widgets, layout, datasets });
    }
    setIsDirty(false);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  }

  function handleNavigate(targetPage) {
    if (isDirty || isWorkspaceEmpty) {
      setPendingNavigation(targetPage);
    } else {
      goTo(targetPage);
    }
  }

  function handleSaveAndLeave() {
    if (project?.id) {
      saveProjectDashboard(project.id, { name: dashboardName, widgets, layout, datasets });
    }
    setIsDirty(false);
    const target = pendingNavigation;
    setPendingNavigation(null);
    if (target) goTo(target);
  }

  function handleLeaveWithoutSaving() {
    if (isWorkspaceEmpty && project?.id) {
      deleteProject(project.id);
    }
    setIsDirty(false);
    const target = pendingNavigation;
    setPendingNavigation(null);
    if (target) goTo(target);
  }

  function handleLoadStarterSample() {
    const sampleKpi = { id: "w_sample_1", type: "kpi", data: widgetDefs.kpi.make(), isStarter: true };
    const sampleLine = { id: "w_sample_2", type: "line", data: widgetDefs.line.make(), isStarter: true };
    const sampleBar = { id: "w_sample_3", type: "bar", data: widgetDefs.bar.make(), isStarter: true };
    setWidgets([sampleKpi, sampleLine, sampleBar]);
    setLayout([
      { i: "w_sample_1", x: 0, y: 0, w: 12, h: 3 },
      { i: "w_sample_2", x: 0, y: 3, w: 6, h: 8 },
      { i: "w_sample_3", x: 6, y: 3, w: 6, h: 8 },
    ]);
    setIsDirty(true);
  }

  function addLayoutEntry(id, type) {
    const { w, h } = defaultSize(type);
    setLayout((prev) => {
      const { x, y } = findFreeSlot(prev, w, h);
      return [...prev, { i: id, x, y, w, h }];
    });
  }

  function handlePaletteClick(key) {
    if (datasets.length === 0) {
      addWidget(key, null, null, null, null, true);
      return;
    }
    setPaletteChoiceType(key);
  }

  function resolvePaletteChoice(action) {
    const key = paletteChoiceType;
    setPaletteChoiceType(null);
    if (!key) return;

    if (action === "sample") {
      addWidget(key, null, null, null, null, true);
      return;
    }

    if (action === "same-axes") {
      const refWidget = selected?.source ? selected : widgets.find((w) => w.source);
      if (refWidget && refWidget.source) {
        const entry = datasets.find((d) => d.id === refWidget.source.datasetId);
        if (entry) {
          const newMapping = remapMapping(refWidget.type, key, refWidget.source.mapping, entry.dataset);
          const mapper = mapperFor[key] || mapperFor.bar;
          const chartTitle = `${refWidget.data?.title || genericLabels[key]} (${genericLabels[key]})`;
          const data = mapper(entry.dataset, { ...newMapping, title: chartTitle });
          const source = { datasetId: refWidget.source.datasetId, mapping: newMapping };
          addWidget(key, data, source, entry.name, chartTitle, false);
          return;
        }
      }
      addWidget(key, null, null, null, null, true);
      return;
    }

    if (action === "different-columns") {
      const preferredId = selected?.source?.datasetId;
      const entry = datasets.find((d) => d.id === preferredId) || datasets[datasets.length - 1];
      setImportReuseContext({ dataset: entry.dataset, datasetId: entry.id, name: entry.name, initialWidgetType: key });
      setShowImport(true);
    }
  }

  function updateDatasetName(datasetId, newName) {
    setDatasets((prev) => prev.map((d) => (d.id === datasetId ? { ...d, name: newName } : d)));
    setIsDirty(true);
  }

  function deleteDataset(datasetId) {
    if (!window.confirm("Remove this dataset?")) return;
    setDatasets((prev) => prev.filter((d) => d.id !== datasetId));
    setIsDirty(true);
  }

  function changeWidgetType(id, newType) {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== id || w.type === newType) return w;
        if (w.source && !w.source.mapping?.hierarchy) {
          const entry = datasets.find((d) => d.id === w.source.datasetId);
          if (entry) {
            const newMapping = remapMapping(w.type, newType, w.source.mapping, entry.dataset);
            const mapper = mapperFor[newType] || mapperFor.bar;
            const data = mapper(entry.dataset, { ...newMapping, title: w.data?.title || genericLabels[newType] });
            return { ...w, type: newType, data, source: { datasetId: w.source.datasetId, mapping: newMapping } };
          }
        }
        return { ...w, type: newType, data: widgetDefs[newType]?.make() || w.data, source: null, isStarter: w.isStarter };
      })
    );
    setIsDirty(true);
  }

  function addWidget(type, presetData, source = null, datasetName = null, chartName = null, isSample = false) {
    const id = "w_" + Date.now();
    const data = presetData || widgetDefs[type].make();
    if (chartName) data.title = chartName;

    const isStarterWidget = isSample || (!source && datasets.length === 0);
    const widgetWithMeta = { id, type, data, source, isStarter: isStarterWidget };

    setWidgets((prev) => {
      if (source) {
        const nonStarters = prev.filter((w) => !w.isStarter);
        return [...nonStarters, widgetWithMeta];
      }
      return [...prev, widgetWithMeta];
    });

    setLayout((prev) => {
      if (source) {
        const sampleIds = new Set(widgets.filter((w) => w.isStarter).map((w) => w.id));
        const cleanLayout = prev.filter((l) => !sampleIds.has(l.i));
        const { w, h } = defaultSize(type);
        const { x, y } = findFreeSlot(cleanLayout, w, h);
        return [...cleanLayout, { i: id, x, y, w, h }];
      }
      const { w, h } = defaultSize(type);
      const { x, y } = findFreeSlot(prev, w, h);
      return [...prev, { i: id, x, y, w, h }];
    });

    setSelectedId(id);
    setIsDirty(true);
  }

  function removeWidget(id) {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
    if (selectedId === id) setSelectedId(null);
    setIsDirty(true);
  }

  function renameSelected(title) {
    setWidgets((prev) => prev.map((w) => (w.id === selectedId ? { ...w, data: { ...w.data, title } } : w)));
    setIsDirty(true);
  }

  function registerDataset(dataset, customName) {
    const id = "d_" + Date.now();
    const name = customName || ("Dataset " + (datasets.length + 1));
    setDatasets((prev) => [...prev, { id, name, dataset, groupId: "proj_" + Date.now() }]);
    setIsDirty(true);
    return id;
  }

  function getShareLink() {
    return generateShareUrl({ name: dashboardName, widgets, layout, datasets });
  }

  function handleCopyShareLink() {
    const shareUrl = getShareLink();
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function handleGmailShare() {
    const shareUrl = getShareLink();
    const subject = encodeURIComponent("Interactive Dashboard: " + dashboardName);
    const body = encodeURIComponent("View this interactive dashboard here:\n\n" + shareUrl);
    window.open("https://mail.google.com/mail/?view=cm&fs=1&su=" + subject + "&body=" + body, "_blank");
  }

  function enterPresentation() {
    pageRef.current?.requestFullscreen?.();
    setPresentFocusId(null);
    setPresentationOrder(null);
    setPresenting(true);
  }

  function exitPresentation() {
    if (document.fullscreenElement) document.exitFullscreen();
    setPresenting(false);
    setPresentFocusId(null);
  }

  function handleThumbDragStart(id) {
    dragThumbRef.current = id;
  }

  function handleThumbDrop(targetId, currentOrderIds) {
    const draggedId = dragThumbRef.current;
    dragThumbRef.current = null;
    if (!draggedId || draggedId === targetId) return;
    const from = currentOrderIds.indexOf(draggedId);
    const to = currentOrderIds.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const next = [...currentOrderIds];
    next.splice(from, 1);
    next.splice(to, 0, draggedId);
    setPresentationOrder(next);
  }

  function renderWidgetContent(w) {
    const Renderer = renderers[w.type];
    if (!Renderer) return null;
    return (
      <Renderer
        data={w.data}
        onDrillDown={(category) => setDrillDown({ widget: w, category })}
      />
    );
  }

  const userInitial = user?.name ? user.name.trim()[0].toUpperCase() : "U";
  const referenceWidget = selected?.source ? selected : widgets.find((w) => w.source);

  return (
    <div
      className={"dashboard-page " + (presenting ? "presenting" : "")}
      ref={pageRef}
      onClick={() => {
        setShowPublishMenu(false);
        setWidgetDownloadMenuId(null);
      }}
    >
      {!presenting && <div className="masthead-accent" />}

      {!presenting && (
        <div className="dashboard-topbar">
          <div className="dashboard-title-group">
            <button className="btn-icon" onClick={() => handleNavigate("projects")} title="Back to My Projects">
              <ArrowLeft size={14} />
            </button>
            <Mark size={18} />
            <input
              className="dashboard-title-input"
              value={dashboardName}
              onChange={(e) => { setDashboardName(e.target.value); setIsDirty(true); }}
            />
            {isDirty && <span className="unsaved-badge" title="You have unsaved changes">Unsaved</span>}
          </div>

          <div className="dashboard-topbar-actions" onClick={(e) => e.stopPropagation()}>
            <ThemeToggle />

            <button className="btn btn-ghost hide-mobile" onClick={() => { setImportReuseContext(null); setShowImport(true); }}>
              <DownloadCloud size={13} className="icon-leading" />
              Import data
            </button>

            <button className="btn btn-ghost" onClick={enterPresentation} title="Presentation View">
              <Maximize size={13} />
            </button>

            <button className="btn btn-amber save-dash-btn" onClick={handleSaveClick} title="Save Dashboard to Project">
              {saveStatus ? <CheckCircle2 size={13} className="icon-leading" /> : <Save size={13} className="icon-leading" />}
              {saveStatus ? "Saved" : "Save"}
            </button>

            <div className="dropdown-wrapper">
              <button className={"btn " + (showPublishMenu ? "btn-amber" : "btn-ghost")} onClick={() => setShowPublishMenu((s) => !s)}>
                <Share2 size={13} className="icon-leading" />
                Publish
              </button>

              {showPublishMenu && (
                <div className="dropdown-popover publish-dropdown">
                  <div className="dropdown-header">Shareable Link</div>
                  <button className="dropdown-item link-copy-item" onClick={handleCopyShareLink}>
                    {copiedLink ? <Check size={14} color="var(--good)" /> : <Share2 size={14} />}
                    <span>{copiedLink ? "Link Copied" : "Copy Interactive Link"}</span>
                  </button>

                  <div className="dropdown-header" style={{ marginTop: 6 }}>Email Sharing</div>
                  <button className="dropdown-item" onClick={handleGmailShare}>
                    <Mail size={14} color="var(--amber)" />
                    <span>Share via Gmail / Email</span>
                  </button>

                  <div className="dropdown-divider" />
                  <div className="dropdown-header">Export Files</div>
                  <button className="dropdown-item" onClick={() => exportCanvasAsPng(canvasRef.current, dashboardName + ".png")}>
                    <ImageDown size={13} />
                    <span>Export PNG Image</span>
                  </button>
                  <button className="dropdown-item" onClick={() => exportCanvasAsPdf(canvasRef.current, dashboardName + ".pdf")}>
                    <FileDown size={13} />
                    <span>Export PDF Document</span>
                  </button>
                </div>
              )}
            </div>

            <button className="google-avatar-btn" onClick={() => setShowProfileDrawer(true)} title="Account Profile">
              <div className="google-avatar-circle">{userInitial}</div>
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showProfileDrawer && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileDrawer(false)}
            />
            <motion.div
              className="profile-slide-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING}
            >
              <div className="drawer-header">
                <span className="drawer-title">Profile & Settings</span>
                <button className="btn-icon" onClick={() => setShowProfileDrawer(false)}>
                  <X size={14} />
                </button>
              </div>

              <div className="profile-hero-card">
                <div className="profile-large-avatar">{userInitial}</div>
                <div className="profile-main-name">{user?.name || "Workspace User"}</div>
                <div className="profile-main-email">{user?.email || "user@visualization.io"}</div>
              </div>

              <div className="drawer-menu-list">
                <div className="drawer-menu-item" onClick={() => { setShowProfileDrawer(false); handleNavigate("projects"); }}>
                  <FolderKanban size={15} color="var(--amber)" />
                  <span>My Data Projects</span>
                </div>
                <div className="drawer-menu-item" onClick={handleGmailShare}>
                  <Mail size={15} color="var(--info)" />
                  <span>Share Dashboard via Gmail</span>
                </div>
                <div className="drawer-menu-item" onClick={toggleTheme}>
                  <ThemeToggle />
                  <span>Toggle Theme ({theme === "dark" ? "Dark" : "Light"})</span>
                </div>
              </div>

              <div className="drawer-footer">
                <button className="btn btn-ghost btn-block btn-danger" onClick={() => { setShowProfileDrawer(false); handleNavigate("login"); }}>
                  <LogOut size={13} className="icon-leading" />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="dashboard-body">
        {!presenting && (
          <div className="dashboard-sidebar hide-mobile">
            <Eyebrow>Visualizations</Eyebrow>
            <div className="widget-palette">
              {Object.entries(widgetDefs).map(([key, def]) => {
                const Icon = def.icon;
                return (
                  <button key={key} className="widget-palette-item" onClick={() => handlePaletteClick(key)}>
                    <Icon size={15} color="var(--amber)" />
                    {genericLabels[key] || def.label}
                    <Plus size={13} className="widget-palette-plus" />
                  </button>
                );
              })}
            </div>

            <div className="suggestion-block">
              <Eyebrow>Project Datasets ({datasets.length})</Eyebrow>
              {datasets.length === 0 ? (
                <div className="inspector-empty">No datasets yet. Click 'Import data' above.</div>
              ) : (
                datasets.map((d) => (
                  <div key={d.id} className="datasource-item">
                    <div className="datasource-row">
                      <span className="dataset-chip">{d.name}</span>
                      <button className="btn-icon" onClick={() => setViewingDatasetId(d.id)} title="View table">
                        <Eye size={11} />
                      </button>
                      <button className="btn-icon" onClick={() => deleteDataset(d.id)} title="Delete dataset">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="dashboard-canvas styled-workspace" ref={canvasRef}>
          {presenting ? (
            <div className="presentation-view-container">
              <div className="presentation-top-controls">
                <span className="presentation-brand-title"><Mark size={16} /> {dashboardName}</span>
                <button className="btn-icon" onClick={exitPresentation}><Minimize size={14} /></button>
              </div>

              {(() => {
                const orderIds = presentationOrder || widgets.map((w) => w.id);
                const ordered = orderIds.map((id) => widgets.find((w) => w.id === id)).filter(Boolean);
                const focused = ordered.find((w) => w.id === presentFocusId);

                return focused ? (
                  <div className="presentation-focus-layout">
                    <div className="presentation-thumbnails">
                      <div className="sidebar-subhead">Charts (Drag to Reorder)</div>
                      {ordered.map((w) => (
                        <motion.div
                          key={w.id}
                          layout
                          transition={SPRING}
                          draggable
                          onDragStart={() => handleThumbDragStart(w.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleThumbDrop(w.id, orderIds)}
                          className={"presentation-thumbnail " + (focused.id === w.id ? "active" : "")}
                          onClick={() => setPresentFocusId(w.id)}
                        >
                          <span className="presentation-thumb-handle"><GripVertical size={11} /></span>
                          <div className="thumb-content-scale">
                            {renderWidgetContent(w)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="presentation-main">
                      <button className="shared-unfocus-btn" onClick={() => setPresentFocusId(null)}>
                        <Minimize size={12} style={{ marginRight: 6 }} /> Back to All Widgets
                      </button>
                      <div className="presentation-fullbleed-focus">
                        {renderWidgetContent(focused)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="presentation-wall">
                    {ordered.map((w) => (
                      <div key={w.id} className="presentation-wall-card" onClick={() => setPresentFocusId(w.id)}>
                        <button className="widget-enlarge-corner-btn" title="Focus view"><Maximize2 size={13} /></button>
                        {renderWidgetContent(w)}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <ReactGridLayout
              className="widget-grid-layout"
              layouts={{ lg: layout }}
              breakpoints={GRID_BREAKPOINTS}
              cols={GRID_COLS}
              rowHeight={28}
              margin={[14, 14]}
              compactType="vertical"
              isDraggable={true}
              isResizable={true}
              draggableCancel=".widget-controls, .widget-controls button, .widget-download-popover, input, select, textarea, button"
              onLayoutChange={(curr) => {
                setLayout(curr);
                setIsDirty(true);
              }}
            >
              {widgets.map((w) => (
                <Frame
                  key={w.id}
                  id={"widget-" + w.id}
                  selected={selectedId === w.id}
                  onClick={() => setSelectedId(w.id)}
                  className="grid-frame"
                >
                  <div className="widget-controls">
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setExpandedWidgetId(w.id); }} title="Enlarge Chart">
                      <Maximize2 size={12} />
                    </button>
                    
                    <div style={{ position: "relative" }}>
                      <button
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWidgetDownloadMenuId(widgetDownloadMenuId === w.id ? null : w.id);
                        }}
                        title="Download Data or Image"
                      >
                        <Download size={12} />
                      </button>

                      {widgetDownloadMenuId === w.id && (
                        <div className="widget-download-popover" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="widget-download-opt"
                            onClick={() => {
                              exportWidgetDataAsCsv(w);
                              setWidgetDownloadMenuId(null);
                            }}
                          >
                            <Table2 size={12} />
                            <span>Download CSV Data</span>
                          </button>
                          <button
                            className="widget-download-opt"
                            onClick={() => {
                              exportWidgetAsPng("widget-" + w.id, (w.data?.title || "chart") + ".png");
                              setWidgetDownloadMenuId(null);
                            }}
                          >
                            <ImageDown size={12} />
                            <span>Download PNG Image</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); removeWidget(w.id); }} title="Delete">
                      <X size={12} />
                    </button>
                  </div>
                  {renderWidgetContent(w)}
                </Frame>
              ))}
            </ReactGridLayout>
          )}

          {!presenting && isWorkspaceEmpty && (
            <div className="dashboard-onboarding-card">
              <div className="onboarding-icon-banner">
                <Lightbulb size={24} color="var(--amber)" />
              </div>
              <h2 className="onboarding-title">Welcome to your workspace</h2>
              <p className="onboarding-desc">
                Choose how you would like to begin your dashboard. You can import your own data file or test interactive charts with sample data.
              </p>

              <div className="onboarding-options-grid">
                <div
                  className="onboarding-opt-card primary"
                  onClick={() => { setImportReuseContext(null); setShowImport(true); }}
                >
                  <div className="onboarding-opt-icon"><FileSpreadsheet size={18} /></div>
                  <div className="onboarding-opt-name">Import Data File</div>
                  <div className="onboarding-opt-sub">Upload CSV, Excel, JSON or paste tables directly</div>
                </div>

                <div
                  className="onboarding-opt-card"
                  onClick={handleLoadStarterSample}
                >
                  <div className="onboarding-opt-icon"><Layers size={18} /></div>
                  <div className="onboarding-opt-name">Load Sample Visualizations</div>
                  <div className="onboarding-opt-sub">Add interactive sample charts to explore the workspace</div>
                </div>
              </div>

              <div className="onboarding-footer-action">
                <button className="onboarding-guide-btn" onClick={() => setShowGuideModal(true)}>
                  <Play size={12} className="icon-leading" />
                  View Interactive Guide
                </button>
              </div>
            </div>
          )}
        </div>

        {!presenting && (
          <div className="dashboard-inspector hide-mobile">
            <Eyebrow><Settings2 size={11} className="icon-leading" /> Inspector</Eyebrow>
            {selected ? (
              <div className="inspector-fields">
                <div className="field">
                  <label className="label">Chart Title</label>
                  <input className="input" value={selected.data?.title || ""} onChange={(e) => renameSelected(e.target.value)} />
                </div>

                <div className="field">
                  <label className="label">Switch Chart Type</label>
                  <div className="inspector-chart-switch-grid">
                    {Object.entries(genericLabels).map(([typeKey, typeLabel]) => (
                      <button
                        key={typeKey}
                        className={"inspector-type-pill " + (selected.type === typeKey ? "active" : "")}
                        onClick={() => changeWidgetType(selected.id, typeKey)}
                        title={"Convert to " + typeLabel}
                      >
                        {typeLabel}
                      </button>
                    ))}
                  </div>
                  <div className="inspector-hint">Changes chart type instantly using the same dataset.</div>
                </div>

                <button className="btn btn-ghost btn-danger" onClick={() => removeWidget(selected.id)}>
                  Remove Widget
                </button>
              </div>
            ) : (
              <div className="inspector-empty">Select any widget to customize its title, convert to another chart type, or inspect data sources.</div>
            )}
          </div>
        )}
      </div>

      {expandedWidgetId && (() => {
        const w = widgets.find((x) => x.id === expandedWidgetId);
        if (!w) return null;
        return (
          <div className="import-overlay" onClick={() => setExpandedWidgetId(null)}>
            <div className="widget-full-screen-shell" onClick={(e) => e.stopPropagation()}>
              <button className="widget-full-screen-close" onClick={() => setExpandedWidgetId(null)}>
                <X size={15} />
              </button>
              <div className="widget-full-screen-content">
                {renderWidgetContent(w)}
              </div>
            </div>
          </div>
        );
      })()}

      {showGuideModal && (
        <div className="import-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="import-panel guide-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="import-panel-header">
              <div className="import-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <HelpCircle size={17} color="var(--amber)" />
                Workspace Quick Guide
              </div>
              <button className="btn-icon" onClick={() => setShowGuideModal(false)}><X size={14} /></button>
            </div>
            <div className="import-subtitle">
              Three quick steps to build and publish interactive visualization dashboards.
            </div>

            <div className="guide-steps-container">
              <div className="guide-step-card">
                <div className="guide-step-number">1</div>
                <div className="guide-step-content">
                  <div className="guide-step-title">Import Data or Paste Table</div>
                  <div className="guide-step-body">
                    Click <strong>Import data</strong> on the top bar. Drop any CSV, Excel (.xlsx), or JSON file, or paste your raw table rows.
                  </div>
                </div>
              </div>

              <div className="guide-step-card">
                <div className="guide-step-number">2</div>
                <div className="guide-step-content">
                  <div className="guide-step-title">Map Fields & Choose Visualizations</div>
                  <div className="guide-step-body">
                    Select your chart type (Bar, Line, KPI, Pie, Stacked, Table) and pick which columns map to your X and Y axes.
                  </div>
                </div>
              </div>

              <div className="guide-step-card">
                <div className="guide-step-number">3</div>
                <div className="guide-step-content">
                  <div className="guide-step-title">Customize, Export & Publish</div>
                  <div className="guide-step-body">
                    Resize and reposition charts on the grid. Export PNG/PDF documents, download raw CSVs, or generate a read-only share link.
                  </div>
                </div>
              </div>
            </div>

            <div className="import-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-amber" onClick={() => { setShowGuideModal(false); setShowImport(true); }}>
                Start by Importing Data
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingNavigation && (
        <div className="import-overlay" onClick={() => setPendingNavigation(null)}>
          <div className="import-panel unsaved-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="import-panel-header">
              <div className="import-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={18} color="var(--warn)" />
                {isWorkspaceEmpty ? "Empty Project Notice" : "Unsaved Changes"}
              </div>
              <button className="btn-icon" onClick={() => setPendingNavigation(null)}><X size={14} /></button>
            </div>

            <div className="import-subtitle">
              {isWorkspaceEmpty
                ? "You have no saved work in this project. If you leave without saving, this project will be permanently removed so your project list stays uncluttered."
                : "You have unsaved changes on this dashboard. Would you like to save before leaving?"}
            </div>

            <div className="import-actions" style={{ justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
              <button className="btn btn-ghost btn-danger" onClick={handleLeaveWithoutSaving}>
                {isWorkspaceEmpty ? "Permanently delete this project" : "Leave without saving"}
              </button>
              <button className="btn btn-amber" onClick={handleSaveAndLeave}>
                Save & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <DataImportPanel
          onClose={() => { setShowImport(false); setImportReuseContext(null); }}
          onCreateWidget={addWidget}
          onDatasetReady={registerDataset}
          onUpdateDatasetName={updateDatasetName}
          industry="general"
          existingDataset={importReuseContext?.dataset}
          existingDatasetId={importReuseContext?.datasetId}
          existingDatasetName={importReuseContext?.name}
          initialWidgetType={importReuseContext?.initialWidgetType}
        />
      )}

      {paletteChoiceType && (
        <PaletteChoiceModal
          typeLabel={genericLabels[paletteChoiceType] || paletteChoiceType}
          referenceTitle={referenceWidget?.data?.title || "Current Chart"}
          canDuplicate={Boolean(referenceWidget?.source)}
          onChoose={resolvePaletteChoice}
          onClose={() => setPaletteChoiceType(null)}
        />
      )}

      {drillDown && (
        <DrillDownModal
          widget={drillDown.widget}
          category={drillDown.category}
          datasets={datasets}
          onClose={() => setDrillDown(null)}
        />
      )}

      {viewingDatasetId && (() => {
        const entry = datasets.find((d) => d.id === viewingDatasetId);
        if (!entry) return null;
        return (
          <DatasetViewModal
            dataset={entry.dataset}
            datasetName={entry.name}
            onClose={() => setViewingDatasetId(null)}
            onSave={(newDs) => {
              setDatasets((prev) => prev.map((d) => (d.id === entry.id ? { ...d, dataset: newDs } : d)));
              setIsDirty(true);
            }}
          />
        );
      })()}
    </div>
  );
}