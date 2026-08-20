import React, { useState, useEffect, useMemo } from "react";
import { X, GitCompare } from "lucide-react";
import { Frame } from "./Frame";
import { renderers } from "./Widgets";
import { generateDebtInsights } from "../utils/biInsights";
import "./ComparePanel.css";

export default function ComparePanel({ widgets, datasets, industry, onClose }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function toggle(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const groups = useMemo(() => {
    const map = {};
    datasets.forEach((d) => {
      (map[d.groupId] = map[d.groupId] || []).push(d);
    });
    return Object.entries(map);
  }, [datasets]);

  const selectedWidgets = widgets.filter((w) => selectedIds.includes(w.id));

  // Every unique dataset behind the selected widgets, grouped by
  // project -- this is what "combined insights" runs against.
  const relatedDatasetsInSelection = useMemo(() => {
    const ids = new Set(selectedWidgets.map((w) => w.source?.datasetId).filter(Boolean));
    return datasets.filter((d) => ids.has(d.id));
  }, [selectedWidgets, datasets]);

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-panel compare-shell" onClick={(e) => e.stopPropagation()}>
        <div className="import-panel-header">
          <div className="import-title"><GitCompare size={15} style={{ verticalAlign: -2, marginRight: 8 }} />Comparative analysis</div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="import-subtitle">
          Pick two or more widgets — from the same dataset to tell one story, or from related datasets to compare across a project.
        </div>

        {groups.length > 0 && (
          <div className="compare-groups">
            {groups.map(([groupId, ds]) => (
              <span key={groupId} className="compare-group-tag" title={ds.map((d) => d.name).join(", ")}>
                Project: {ds.map((d) => d.name).join(" + ")}
              </span>
            ))}
          </div>
        )}

        <div className="compare-picker">
          {widgets.length === 0 ? (
            <div className="insights-empty">No widgets on this dashboard yet.</div>
          ) : (
            widgets.map((w) => (
              <label key={w.id} className="compare-pick-item">
                <input type="checkbox" checked={selectedIds.includes(w.id)} onChange={() => toggle(w.id)} />
                {w.data.title}
              </label>
            ))
          )}
        </div>

        {selectedWidgets.length >= 2 && (
          <>
            <div className="compare-grid">
              {selectedWidgets.map((w) => {
                const Renderer = renderers[w.type];
                return (
                  <Frame key={w.id} className="compare-grid-item">
                    <Renderer data={w.data} />
                  </Frame>
                );
              })}
            </div>

            {industry === "pdmo" && relatedDatasetsInSelection.length > 0 && (
              <button className="btn btn-ghost compare-insights-trigger" onClick={() => setShowInsights((s) => !s)}>
                {showInsights ? "Hide" : "Generate"} combined insights
              </button>
            )}

            {showInsights && (
              <div style={{ marginTop: 14 }}>
                {relatedDatasetsInSelection.map((d) => {
                  const insight = generateDebtInsights(d.dataset);
                  const allLines = [...insight.descriptive, ...insight.diagnostic, ...insight.decision];
                  return (
                    <div key={d.id} className="compare-insight-group">
                      <div className="compare-insight-group-title">{d.name}</div>
                      {allLines.length === 0
                        ? <div className="insights-empty">No recognizable debt columns in this dataset.</div>
                        : allLines.map((line, i) => <div key={i} className="insights-bullet">{line}</div>)}
                    </div>
                  );
                })}
                {relatedDatasetsInSelection.length > 1 && (
                  <div className="insights-empty">
                    These datasets are part of the same project — compare the figures above directly since they're marked related.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
