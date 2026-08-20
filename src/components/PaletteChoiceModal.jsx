import React, { useEffect } from "react";
import { X, Copy, Columns, LayoutGrid } from "lucide-react";
import "./PaletteChoiceModal.css";

export default function PaletteChoiceModal({
  typeLabel,
  referenceTitle,
  canDuplicate,
  onChoose,
  onClose,
}) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-panel palette-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="import-panel-header">
          <div className="import-title">Add {typeLabel} Widget</div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="import-subtitle">
          You have imported data available. How would you like to build this {typeLabel}?
        </div>

        {canDuplicate && (
          <div className="palette-choice-option" onClick={() => onChoose("same-axes")}>
            <div className="palette-choice-icon-wrap">
              <Copy size={16} color="var(--amber)" />
            </div>
            <div>
              <div className="palette-choice-title">Plot "{referenceTitle}" as a {typeLabel}</div>
              <div className="palette-choice-body">
                Use the <strong>exact same X and Y axes</strong> on this new chart type. Perfect for comparing visual perspectives on the same data.
              </div>
            </div>
          </div>
        )}

        <div className="palette-choice-option" onClick={() => onChoose("different-columns")}>
          <div className="palette-choice-icon-wrap">
            <Columns size={16} color="var(--info)" />
          </div>
          <div>
            <div className="palette-choice-title">Choose different columns from dataset</div>
            <div className="palette-choice-body">
              Select different categories and values from your imported data without re-uploading the file.
            </div>
          </div>
        </div>

        <div className="palette-choice-option" onClick={() => onChoose("sample")}>
          <div className="palette-choice-icon-wrap">
            <LayoutGrid size={16} color="var(--text-muted)" />
          </div>
          <div>
            <div className="palette-choice-title">Show sample placeholder {typeLabel}</div>
            <div className="palette-choice-body">
              Insert a temporary mock chart with sample numbers, not linked to your data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}