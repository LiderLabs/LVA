import React, { useState, useEffect, useMemo } from "react";
import { X, Eye, Search, Lightbulb } from "lucide-react";
import { generateDebtInsights } from "../utils/biInsights";
import "./InsightsPanel.css";

export default function InsightsPanel({ datasets, onClose }) {
  const [datasetId, setDatasetId] = useState(datasets[0]?.id || "");

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const activeDataset = datasets.find((d) => d.id === datasetId)?.dataset;
  const insights = useMemo(() => (activeDataset ? generateDebtInsights(activeDataset) : null), [activeDataset]);

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-panel" onClick={(e) => e.stopPropagation()}>
        <div className="import-panel-header">
          <div className="import-title">BI Insights</div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="import-subtitle">
          What happened, why it likely happened, and what it suggests doing — generated from your imported data's recognizable columns.
        </div>

        {datasets.length === 0 ? (
          <div className="insights-empty">Import a debt dataset first, then come back here.</div>
        ) : (
          <>
            <div className="field">
              <label className="label">Dataset</label>
              <select className="import-select" value={datasetId} onChange={(e) => setDatasetId(e.target.value)}>
                {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="insights-section">
              <div className="insights-section-title descriptive"><Eye size={12} /> What happened</div>
              {insights.descriptive.length === 0
                ? <div className="insights-empty">No total-debt or GDP-style columns recognized in this dataset yet.</div>
                : insights.descriptive.map((line, i) => <div key={i} className="insights-bullet">{line}</div>)}
            </div>

            <div className="insights-section">
              <div className="insights-section-title diagnostic"><Search size={12} /> Why it likely happened</div>
              {insights.diagnostic.length === 0
                ? <div className="insights-empty">No significant composition or rate shifts detected — or not enough columns to compare periods.</div>
                : insights.diagnostic.map((line, i) => <div key={i} className="insights-bullet">{line}</div>)}
            </div>

            <div className="insights-section">
              <div className="insights-section-title decision"><Lightbulb size={12} /> What to consider doing</div>
              {insights.decision.length === 0
                ? <div className="insights-empty">Nothing to flag yet.</div>
                : insights.decision.map((line, i) => <div key={i} className="insights-bullet">{line}</div>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
