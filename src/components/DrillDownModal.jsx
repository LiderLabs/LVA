import React, { useEffect } from "react";
import { X } from "lucide-react";
import "./DrillDownModal.css";

// Which mapping field held the "category" for each widget type -- this
// is what we filter the original dataset rows against when a chart
// segment is clicked. Hierarchy widgets (see dataImport.js) are
// different: by the time this modal opens for one, the user has
// clicked past the last level in the hierarchy, so we filter on every
// column in the path (continent AND country AND city...) rather than
// just one.
function filterRows(rows, type, mapping, category) {
  if (mapping.hierarchy) {
    const fullPath = [...mapping.path, category];
    return rows.filter((r) => fullPath.every((val, i) => String(r[mapping.hierarchy[i]]) === String(val)));
  }
  const col =
    type === "pie" || type === "table" ? mapping.nameCol :
    type === "radar" ? mapping.axisCol :
    mapping.labelCol; // bar, stackedBar, waterfall, funnel, line, area
  return rows.filter((r) => String(r[col]) === String(category));
}

export default function DrillDownModal({ widget, category, datasets, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const source = widget.source;
  const entry = source ? datasets.find((d) => d.id === source.datasetId) : null;

  let rows = [];
  let columns = [];

  if (entry) {
    rows = filterRows(entry.dataset.rows, widget.type, source.mapping, category);
    columns = entry.dataset.columns;
  }

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-panel" onClick={(e) => e.stopPropagation()}>
        <div className="import-panel-header">
          <div>
            <div className="drilldown-eyebrow">{widget.data.title}</div>
            <div className="drilldown-heading">{category}</div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        {rows.length > 0 ? (
          <table className="drilldown-table">
            <thead>
              <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>{columns.map((c) => <td key={c}>{String(r[c])}</td>)}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="drilldown-empty">
            {source
              ? "No matching rows found in the source dataset for this segment."
              : "This widget isn't bound to imported data, so there's no further detail to drill into. Import a dataset and build this chart from it to enable full drill-down detail."}
          </div>
        )}
      </div>
    </div>
  );
}
