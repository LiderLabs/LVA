import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize, LayoutGrid, MonitorPlay, Share2, Check, ImageDown, FileDown, GripVertical } from "lucide-react";
import { renderers } from "../components/Widgets";
import { exportCanvasAsPng, exportCanvasAsPdf } from "../utils/exportUtils";
import DrillDownModal from "../components/DrillDownModal";
import "./SharedDashboard.css";

const SPRING = { type: "spring", stiffness: 350, damping: 28 };

export default function SharedDashboard({ data }) {
  const [viewMode, setViewMode] = useState("interactive"); // "interactive" | "canvas"
  const [focusId, setFocusId] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [presentationOrder, setPresentationOrder] = useState(null);
  const [drillDown, setDrillDown] = useState(null);

  // Dedicated refs for the visible and background Executive Canvas export targets
  const visibleCanvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const dragThumbRef = useRef(null);

  const widgets = data?.widgets || [];
  const datasets = data?.datasets || [];
  const dashboardName = data?.name || "LVA Dashboard";

  const orderIds = presentationOrder || widgets.map((w) => w.id);
  const orderedWidgets = orderIds.map((id) => widgets.find((w) => w.id === id)).filter(Boolean);
  const focusedWidget = orderedWidgets.find((w) => w.id === focusId);

  const kpiWidgets = widgets.filter((w) => w.type === "kpi" || w.type === "scoreboard" || w.type === "scorecard");
  const chartWidgets = widgets.filter((w) => w.type !== "kpi" && w.type !== "scoreboard" && w.type !== "scorecard");

  function handleCopyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function getExportNode() {
    if (viewMode === "canvas" && visibleCanvasRef.current) {
      return visibleCanvasRef.current;
    }
    return hiddenCanvasRef.current;
  }

  function handleDownloadPng() {
    setShowDrawer(false);
    setTimeout(() => {
      const node = getExportNode();
      if (node) {
        exportCanvasAsPng(node, dashboardName + ".png");
      }
    }, 180);
  }

  function handleDownloadPdf() {
    setShowDrawer(false);
    setTimeout(() => {
      const node = getExportNode();
      if (node) {
        exportCanvasAsPdf(node, dashboardName + ".pdf");
      }
    }, 180);
  }

  function handleThumbDragStart(id) {
    dragThumbRef.current = id;
  }

  function handleThumbDrop(targetId) {
    const draggedId = dragThumbRef.current;
    dragThumbRef.current = null;
    if (!draggedId || draggedId === targetId) return;
    const from = orderIds.indexOf(draggedId);
    const to = orderIds.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const next = [...orderIds];
    next.splice(from, 1);
    next.splice(to, 0, draggedId);
    setPresentationOrder(next);
  }

  function renderWidget(w) {
    const Renderer = renderers[w.type];
    if (!Renderer) return null;
    return (
      <Renderer
        data={w.data}
        onDrillDown={(category) => setDrillDown({ widget: w, category })}
      />
    );
  }

  function renderExecutiveCanvasContent() {
    return (
      <>
        <div className="lva-dashboard-title">{dashboardName}</div>

        {kpiWidgets.length > 0 && (
          <div className="lva-kpi-ribbon">
            {kpiWidgets.map((w, i) => (
              <div key={w.id} className={"lva-kpi-card banner-" + (i % 4)}>
                {renderWidget(w)}
              </div>
            ))}
          </div>
        )}

        <div className="lva-charts-grid" data-count={chartWidgets.length}>
          {(chartWidgets.length > 0 ? chartWidgets : widgets).map((w) => (
            <div key={w.id} className="lva-chart-card">
              {renderWidget(w)}
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="shared-canvas-root">
      {/* Hidden Side Drawer Trigger Button */}
      <div className="shared-hidden-drawer-trigger" onClick={() => setShowDrawer((s) => !s)} title="Layout & Sharing Options">
        <LayoutGrid size={15} />
      </div>

      {/* Slide-In Options Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              className="shared-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              className="shared-options-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING}
            >
              <div className="shared-drawer-header">
                <span>Display & Sharing</span>
                <button className="btn-icon" onClick={() => setShowDrawer(false)}>✕</button>
              </div>

              <div className="drawer-sub-label">View Layout</div>
              <div className="shared-drawer-options">
                <button
                  className={"shared-drawer-opt " + (viewMode === "interactive" ? "active" : "")}
                  onClick={() => { setViewMode("interactive"); setShowDrawer(false); }}
                >
                  <MonitorPlay size={15} />
                  <div>
                    <div className="opt-title">Interactive Focus Mode</div>
                    <div className="opt-desc">Full-screen grid with click-to-enlarge & reorderable live sidebar.</div>
                  </div>
                </button>

                <button
                  className={"shared-drawer-opt " + (viewMode === "canvas" ? "active" : "")}
                  onClick={() => { setViewMode("canvas"); setFocusId(null); setShowDrawer(false); }}
                >
                  <LayoutGrid size={15} />
                  <div>
                    <div className="opt-title">Executive Canvas Layout</div>
                    <div className="opt-desc">Clean overview with top KPI highlights and executive chart cards.</div>
                  </div>
                </button>
              </div>

              <div className="drawer-sub-label" style={{ marginTop: 24 }}>Share & Export</div>
              <div className="shared-drawer-options">
                <button className="shared-drawer-opt" onClick={handleCopyShareLink}>
                  {copiedLink ? <Check size={15} color="var(--good)" /> : <Share2 size={15} />}
                  <div>
                    <div className="opt-title">{copiedLink ? "Link Copied!" : "Forward / Copy Share Link"}</div>
                    <div className="opt-desc">Copy this interactive dashboard link to forward to colleagues.</div>
                  </div>
                </button>

                <button className="shared-drawer-opt" onClick={handleDownloadPng}>
                  <ImageDown size={15} />
                  <div>
                    <div className="opt-title">Download PNG Image</div>
                    <div className="opt-desc">Export high-resolution Executive Canvas dashboard image.</div>
                  </div>
                </button>

                <button className="shared-drawer-opt" onClick={handleDownloadPdf}>
                  <FileDown size={15} />
                  <div>
                    <div className="opt-title">Download PDF Document</div>
                    <div className="opt-desc">Export print-ready Executive Canvas PDF document.</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODE 1: Interactive View */}
      {viewMode === "interactive" && (
        <div className="shared-canvas-stage">
          {focusedWidget ? (
            <div className="shared-focus-layout">
              <div className="shared-live-thumbnails">
                <div className="sidebar-subhead">Charts (Drag to Reorder)</div>
                {orderedWidgets.map((w) => (
                  <motion.div
                    key={w.id}
                    layout
                    transition={SPRING}
                    draggable
                    onDragStart={() => handleThumbDragStart(w.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleThumbDrop(w.id)}
                    className={"shared-live-thumb-card " + (focusedWidget.id === w.id ? "active" : "")}
                    onClick={() => setFocusId(w.id)}
                  >
                    <div className="thumb-drag-handle"><GripVertical size={12} /></div>
                    <div className="thumb-content-scale">
                      {renderWidget(w)}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="shared-main-focus-stage">
                <button className="shared-unfocus-btn" onClick={() => setFocusId(null)}>
                  <Minimize size={13} style={{ marginRight: 6 }} />
                  Back to All Widgets
                </button>
                <div className="shared-focus-card">
                  {renderWidget(focusedWidget)}
                </div>
              </div>
            </div>
          ) : (
            <div className="shared-all-widgets-grid" data-count={orderedWidgets.length}>
              {orderedWidgets.map((w) => (
                <div key={w.id} className="shared-widget-card" onClick={() => setFocusId(w.id)}>
                  <button className="shared-card-expand-btn" title="Focus this chart">
                    <Maximize2 size={13} />
                  </button>
                  {renderWidget(w)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Visible Executive Canvas Layout */}
      {viewMode === "canvas" && (
        <div className="lva-canvas-container" ref={visibleCanvasRef}>
          {renderExecutiveCanvasContent()}
        </div>
      )}

      {/* Dedicated Executive Canvas Target for Background PNG/PDF Export (Always Available) */}
      <div className="lva-export-canvas-hidden" ref={hiddenCanvasRef}>
        {renderExecutiveCanvasContent()}
      </div>

      {drillDown && (
        <DrillDownModal
          widget={drillDown.widget}
          category={drillDown.category}
          datasets={datasets}
          onClose={() => setDrillDown(null)}
        />
      )}
    </div>
  );
}