import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import "./DatasetViewModal.css";

export default function DatasetViewModal({ dataset, datasetName, onClose, onSave }) {
  const [rows, setRows] = useState(dataset.rows);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function editCell(rowIndex, col, value) {
    setRows((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [col]: value };
      return next;
    });
    setDirty(true);
  }

  function deleteRow(rowIndex) {
    setRows((prev) => prev.filter((_, i) => i !== rowIndex));
    setDirty(true);
  }

  function handleSave() {
    onSave({ ...dataset, rows });
    setDirty(false);
    onClose();
  }

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-panel dataset-view-shell" onClick={(e) => e.stopPropagation()}>
        <div className="import-panel-header">
          <div className="import-title">{datasetName}</div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="import-subtitle">Every row is editable here — changes apply to every widget built from this dataset once saved.</div>

        <div className="dataset-view-table-wrap">
          <table className="dataset-view-table">
            <thead>
              <tr>
                {dataset.columns.map((c) => <th key={c}>{c}</th>)}
                <th className="dataset-view-row-actions"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {dataset.columns.map((c) => (
                    <td key={c}>
                      <input
                        className="dataset-view-cell"
                        value={row[c] ?? ""}
                        onChange={(e) => editCell(i, c, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="dataset-view-row-actions">
                    <button className="btn-icon" onClick={() => deleteRow(i)} title="Delete row"><Trash2 size={11} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dataset-view-footer">
          <span className="dataset-view-count">{rows.length} rows</span>
          <div className="import-actions" style={{ marginTop: 0 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-amber" disabled={!dirty} onClick={handleSave}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
