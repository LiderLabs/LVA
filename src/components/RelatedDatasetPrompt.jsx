import React from "react";
import { Link2 } from "lucide-react";

export default function RelatedDatasetPrompt({ onAnswer }) {
  return (
    <div className="import-overlay" onClick={() => onAnswer(true)}>
      <div className="import-panel" onClick={(e) => e.stopPropagation()} style={{ width: 380 }}>
        <div className="import-panel-header">
          <div className="import-title"><Link2 size={15} style={{ verticalAlign: -2, marginRight: 8 }} />Related data?</div>
        </div>
        <div className="import-subtitle">
          Is this new import related to the data you already have — part of the same project or story — or is it something separate?
        </div>
        <div className="import-actions" style={{ justifyContent: "space-between" }}>
          <button className="btn btn-ghost" onClick={() => onAnswer(false)}>Separate project</button>
          <button className="btn btn-amber" onClick={() => onAnswer(true)}>Yes, related</button>
        </div>
      </div>
    </div>
  );
}
