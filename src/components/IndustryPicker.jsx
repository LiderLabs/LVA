import React, { useEffect } from "react";
import { X, Landmark } from "lucide-react";
import "./IndustryPicker.css";

export default function IndustryPicker({ onClose, onOpenIndustry }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-panel" onClick={(e) => e.stopPropagation()}>
        <div className="import-panel-header">
          <div className="import-title">Industries</div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="import-subtitle">
          Purpose-built dashboards with their own chart naming, sample data, and analytics functions, built on the same engine as this general dashboard.
        </div>

        <div className="industry-option" onClick={() => onOpenIndustry("pdmo")}>
          <div className="industry-option-icon"><Landmark size={17} /></div>
          <div>
            <div className="industry-option-title">Public Debt Management Office</div>
            <div className="industry-option-body">
              Debt-specific chart types, a starter debt-overview template, and built-in formulas like DebtToGDP and RefinancingRisk.
            </div>
          </div>
        </div>

        <div className="industry-option industry-option-soon">
          <div className="industry-option-icon">···</div>
          <div>
            <div className="industry-option-title">More industries coming soon</div>
            <div className="industry-option-body">Built on the same engine — new industries just mean new naming, sample data, and formulas.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
