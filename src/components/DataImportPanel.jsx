import React, { useState, useRef, useEffect } from "react";
import { X, DownloadCloud, CheckCircle2, RefreshCw } from "lucide-react";
import { widgetDefs, genericLabels } from "./Widgets";
import {
  parseFile, parsePastedText, classifyColumns,
  mapToSeries, mapToStacked, mapToPie, mapToScatter, mapToRadar, mapToTable, mapToKpi, mapToWaterfall,
  mapToFunnel, mapToScoreboard, mapToScoreCard, mapToAuction, computeHierarchyLevel, computeHierarchyLevelPie,
} from "../utils/dataImport";
import "./DataImportPanel.css";

const typeConfig = {
  kpi: { fields: ["valueCol"], mapper: mapToKpi },
  line: { fields: ["labelCol", "valueCol"], mapper: mapToSeries },
  area: { fields: ["labelCol", "valueCol"], mapper: mapToSeries },
  bar: { fields: ["labelCol", "valueCol"], mapper: mapToSeries },
  waterfall: { fields: ["labelCol", "valueCol"], mapper: mapToWaterfall },
  stackedBar: { fields: ["labelCol", "valueCols"], mapper: mapToStacked },
  pie: { fields: ["nameCol", "valueCol"], mapper: mapToPie },
  scatter: { fields: ["xCol", "yCol"], mapper: mapToScatter },
  radar: { fields: ["axisCol", "valueCol"], mapper: mapToRadar },
  funnel: { fields: ["labelCol", "valueCol"], mapper: mapToFunnel },
  scoreboard: { fields: ["valueCols"], mapper: mapToScoreboard },
  scorecard: { fields: ["valueCol", "targetCol"], mapper: mapToScoreCard },
  yieldCurve: { fields: ["labelCol", "valueCol"], mapper: mapToSeries },
  auction: { fields: ["dateCol", "securityCol", "offeredCol", "allottedCol", "yieldCol", "bidsCol"], mapper: mapToAuction },
  table: { fields: ["nameCol", "valueCol", "changeCol"], mapper: mapToTable },
};

const fieldLabels = {
  labelCol: "Category / label column",
  valueCol: "Value column",
  valueCols: "Value columns (select one or more)",
  nameCol: "Name column",
  xCol: "X-axis column",
  yCol: "Y-axis column",
  axisCol: "Axis label column",
  changeCol: "Change column (optional)",
  targetCol: "Target column",
  dateCol: "Date column",
  securityCol: "Security column",
  offeredCol: "Amount offered column",
  allottedCol: "Amount allotted column",
  yieldCol: "Yield column",
  bidsCol: "Total bids received column (optional, for bid-to-cover)",
};

function describeMapping(widgetType, mapping) {
  switch (widgetType) {
    case "line": case "area": case "bar": case "waterfall": case "funnel": case "yieldCurve":
      return mapping.labelCol && mapping.valueCol ? `X-axis: ${mapping.labelCol} — Y-axis: ${mapping.valueCol}` : "";
    case "stackedBar": case "scoreboard":
      return mapping.labelCol && mapping.valueCols?.length ? `X-axis: ${mapping.labelCol} — Values: ${mapping.valueCols.join(", ")}` : "";
    case "pie":
      return mapping.nameCol && mapping.valueCol ? `Category: ${mapping.nameCol} — Value: ${mapping.valueCol}` : "";
    case "radar":
      return mapping.axisCol && mapping.valueCol ? `Axis labels: ${mapping.axisCol} — Value: ${mapping.valueCol}` : "";
    case "table":
      return mapping.nameCol && mapping.valueCol ? `Row label: ${mapping.nameCol} — Value: ${mapping.valueCol}` : "";
    case "scatter":
      return mapping.xCol && mapping.yCol ? `X-axis: ${mapping.xCol} — Y-axis: ${mapping.yCol}` : "";
    case "kpi":
      return mapping.valueCol ? `Value: ${mapping.valueCol} (${mapping.aggregate || "sum"})` : "";
    case "scorecard":
      return mapping.valueCol && mapping.targetCol ? `Actual: ${mapping.valueCol} — Target: ${mapping.targetCol}` : "";
    case "auction":
      return mapping.securityCol && mapping.yieldCol ? `Security: ${mapping.securityCol} — Yield: ${mapping.yieldCol}` : "";
    default:
      return "";
  }
}

export default function DataImportPanel({
  onClose, onCreateWidget, onDatasetReady, onUpdateDatasetName, industry,
  existingDataset, existingDatasetId, existingDatasetName, initialWidgetType,
}) {
  const labelFor = (key) => (industry === "pdmo" ? widgetDefs[key].label : genericLabels[key]);
  const reuseMode = Boolean(existingDataset);

  const [dataset, setDataset] = useState(existingDataset || null);
  const [datasetId, setDatasetId] = useState(existingDatasetId || null);
  const [error, setError] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [widgetType, setWidgetType] = useState(initialWidgetType || "bar");
  const [mapping, setMapping] = useState(() => (existingDataset ? defaultMappingFor(existingDataset) : {}));
  const [title, setTitle] = useState("");
  const [hierarchyEnabled, setHierarchyEnabled] = useState(false);
  const [hierarchyCols, setHierarchyCols] = useState([]);
  const [datasetName, setDatasetName] = useState(existingDatasetName || "");
  const [importMode, setImportMode] = useState(existingDataset ? "widget" : "select");
  const [datasetSavedSuccess, setDatasetSavedSuccess] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const columns = dataset ? classifyColumns(dataset) : { numeric: [], text: [] };

  function defaultMappingFor(parsed) {
    const cls = classifyColumns(parsed);
    return {
      labelCol: cls.text[0] || parsed.columns[0],
      nameCol: cls.text[0] || parsed.columns[0],
      axisCol: cls.text[0] || parsed.columns[0],
      xCol: cls.numeric[0] || parsed.columns[0],
      yCol: cls.numeric[1] || cls.numeric[0] || parsed.columns[0],
      valueCol: cls.numeric[0] || parsed.columns[0],
      valueCols: cls.numeric.slice(0, 2),
      changeCol: "",
    };
  }

  async function handleFile(file) {
    setError("");
    try {
      const parsed = await parseFile(file);
      applyDataset(parsed);
    } catch (err) {
      setError(err.message);
    }
  }

  function handlePaste() {
    setError("");
    try {
      const parsed = parsePastedText(pasteText);
      applyDataset(parsed);
    } catch (err) {
      setError("Couldn't read that as tabular data. Try pasting with column headers on the first row.");
    }
  }

  function applyDataset(parsed) {
    if (!parsed.rows.length) {
      setError("No rows found in that data.");
      return;
    }
    setDataset(parsed);
    setMapping(defaultMappingFor(parsed));
    if (!reuseMode && !datasetName) {
      setDatasetName(`Import ${parsed.rows.length} rows`);
    }
  }

  function handleDirectSaveDataset() {
    const finalName = datasetName.trim() || `Dataset ${Date.now()}`;
    const id = onDatasetReady?.(dataset, finalName);
    setDatasetId(id);
    setDatasetSavedSuccess(true);
  }

  function handleResetForAnotherImport() {
    setDataset(null);
    setDatasetId(null);
    setPasteText("");
    setDatasetName("");
    setDatasetSavedSuccess(false);
    setImportMode("select");
  }

  function toggleValueCol(col) {
    setMapping((m) => {
      const has = m.valueCols?.includes(col);
      return { ...m, valueCols: has ? m.valueCols.filter((c) => c !== col) : [...(m.valueCols || []), col] };
    });
  }

  function toggleHierarchyCol(col) {
    setHierarchyCols((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
  }

  const supportsHierarchy = widgetType === "bar" || widgetType === "pie";
  const description = describeMapping(widgetType, mapping);

  const config = typeConfig[widgetType];
  const canCreate =
    dataset &&
    (supportsHierarchy && hierarchyEnabled
      ? hierarchyCols.length > 0 && mapping.valueCol
      : config.fields.every((f) => (f === "changeCol" || f === "bidsCol" ? true : f === "valueCols" ? mapping.valueCols?.length : mapping[f])));

  function handleCreateWidget() {
    let finalDatasetId = datasetId;
    if (!finalDatasetId && !reuseMode) {
      finalDatasetId = onDatasetReady?.(dataset, datasetName.trim() || "Imported Dataset");
    }

    if (reuseMode && datasetName !== existingDatasetName && onUpdateDatasetName) {
      onUpdateDatasetName(finalDatasetId, datasetName);
    }

    if (supportsHierarchy && hierarchyEnabled && hierarchyCols.length > 0) {
      const hierarchyMapping = { hierarchy: hierarchyCols, valueCol: mapping.valueCol, level: 0, path: [] };
      const data =
        widgetType === "pie"
          ? computeHierarchyLevelPie(dataset, { ...hierarchyMapping, title })
          : computeHierarchyLevel(dataset, { ...hierarchyMapping, title });
      const source = finalDatasetId ? { datasetId: finalDatasetId, mapping: hierarchyMapping } : null;
      onCreateWidget(widgetType, data, source, datasetName, title);
      onClose();
      return;
    }

    const config = typeConfig[widgetType];
    const data = config.mapper(dataset, { ...mapping, title });
    const source = finalDatasetId ? { datasetId: finalDatasetId, mapping: { ...mapping } } : null;
    onCreateWidget(widgetType, data, source, datasetName, title);
    onClose();
  }

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-panel" onClick={(e) => e.stopPropagation()}>
        <div className="import-panel-header">
          <div className="import-title">{reuseMode ? "Add Another Visualization" : "Import Data"}</div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="import-subtitle">
          {reuseMode
            ? `Build a new chart from "${existingDatasetName}" — pick columns to create a new perspective.`
            : "Upload CSV, Excel (.xlsx), JSON, or paste a table directly."}
        </div>

        {!dataset && (
          <>
            <div className="import-dropzone" onClick={() => fileRef.current?.click()}>
              <DownloadCloud size={18} style={{ marginBottom: 6 }} />
              <div>Click to choose a file, or drag one here</div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                style={{ display: "none" }}
                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
              />
            </div>
            <div className="import-or">OR PASTE TABLE</div>
            <textarea
              className="import-textarea"
              placeholder={"year,amount\n2024,224\n2025,251\n2026,282"}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <div className="import-actions">
              <button className="btn btn-amber" onClick={handlePaste} disabled={!pasteText.trim()}>Use pasted data</button>
            </div>
          </>
        )}

        {error && <div className="import-error">{error}</div>}

        {dataset && (
          <>
            {!reuseMode && !datasetSavedSuccess && importMode === "select" && (
              <>
                <div className="import-section-title">Preview — {dataset.rows.length} rows</div>
                <table className="import-preview-table">
                  <thead>
                    <tr>{dataset.columns.map((c) => <th key={c}>{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {dataset.rows.slice(0, 4).map((r, i) => (
                      <tr key={i}>{dataset.columns.map((c) => <td key={c}>{String(r[c])}</td>)}</tr>
                    ))}
                  </tbody>
                </table>

                <div className="import-section-title">Dataset Name</div>
                <div className="field">
                  <input
                    className="input"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="Name this dataset"
                  />
                  <div className="inspector-hint">Enter a descriptive title for easy identification in your project.</div>
                </div>

                <div className="import-section-title">What would you like to do?</div>
                <div className="import-mode-selector">
                  <button
                    className="import-mode-btn primary"
                    onClick={() => setImportMode("widget")}
                  >
                    Create a chart now
                  </button>
                  <button
                    className="import-mode-btn"
                    onClick={handleDirectSaveDataset}
                  >
                    Save dataset for later
                  </button>
                </div>
              </>
            )}

            {datasetSavedSuccess && (
              <div className="dataset-saved-prompt-card">
                <div className="dataset-saved-header">
                  <CheckCircle2 size={18} color="var(--good)" />
                  <span>Dataset Saved to Project</span>
                </div>
                <p className="dataset-saved-body">
                  "{datasetName}" has been stored in your Project Datasets sidebar. Would you like to import another dataset now?
                </p>

                <div className="dataset-saved-actions">
                  <button className="btn btn-ghost" onClick={handleResetForAnotherImport}>
                    <RefreshCw size={12} className="icon-leading" />
                    Import another dataset
                  </button>
                  <button className="btn btn-amber" onClick={onClose}>
                    Done for now
                  </button>
                </div>
              </div>
            )}

            {(reuseMode || importMode === "widget") && !datasetSavedSuccess && (
              <>
                <div className="import-section-title">Chart Type</div>
                <div className="import-type-grid">
                  {Object.entries(widgetDefs).map(([key, def]) => {
                    const Icon = def.icon;
                    return (
                      <div
                        key={key}
                        className={`import-type-option ${widgetType === key ? "active" : ""}`}
                        onClick={() => setWidgetType(key)}
                      >
                        <Icon size={13} />
                        {labelFor(key)}
                      </div>
                    );
                  })}
                </div>

                <div className="import-section-title">Map Columns</div>
                <div className="field">
                  <label className="label">Chart Name</label>
                  <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={labelFor(widgetType)} />
                </div>

                {supportsHierarchy && (
                  <div className="field">
                    <label className="hierarchy-toggle">
                      <input
                        type="checkbox"
                        checked={hierarchyEnabled}
                        onChange={(e) => setHierarchyEnabled(e.target.checked)}
                      />
                      Enable multi-level drill-down
                    </label>
                    {hierarchyEnabled && (
                      <>
                        <div className="hierarchy-hint">
                          Click text columns in the order you want to drill through them.
                        </div>
                        <div className="import-multiselect">
                          {columns.text.map((c) => {
                            const order = hierarchyCols.indexOf(c);
                            return (
                              <div key={c} className={`import-chip ${order >= 0 ? "selected" : ""}`} onClick={() => toggleHierarchyCol(c)}>
                                {order >= 0 && <span className="hierarchy-order">{order + 1}</span>} {c}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!(supportsHierarchy && hierarchyEnabled) &&
                  config.fields.filter((f) => f !== "valueCols").map((field) => (
                    <div className="field" key={field}>
                      <label className="label">{fieldLabels[field]}</label>
                      <select className="import-select" value={mapping[field] || ""} onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value }))}>
                        {(field === "changeCol" || field === "bidsCol") && <option value="">None</option>}
                        {dataset.columns.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  ))}

                {supportsHierarchy && hierarchyEnabled && (
                  <div className="field">
                    <label className="label">Value column (what to sum at each level)</label>
                    <select className="import-select" value={mapping.valueCol || ""} onChange={(e) => setMapping((m) => ({ ...m, valueCol: e.target.value }))}>
                      {dataset.columns.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {config.fields.includes("valueCols") && (
                  <div className="field">
                    <label className="label">{fieldLabels.valueCols}</label>
                    <div className="import-multiselect">
                      {columns.numeric.map((c) => (
                        <div key={c} className={`import-chip ${mapping.valueCols?.includes(c) ? "selected" : ""}`} onClick={() => toggleValueCol(c)}>
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {widgetType === "kpi" && (
                  <div className="field">
                    <label className="label">Aggregate</label>
                    <select className="import-select" value={mapping.aggregate || "sum"} onChange={(e) => setMapping((m) => ({ ...m, aggregate: e.target.value }))}>
                      <option value="sum">Sum</option>
                      <option value="average">Average</option>
                    </select>
                  </div>
                )}

                {description && !hierarchyEnabled && (
                  <div className="mapping-preview">Plotting — {description}</div>
                )}

                <div className="import-actions">
                  {!reuseMode && <button className="btn btn-ghost" onClick={() => setImportMode("select")}>Back</button>}
                  <button className="btn btn-amber" disabled={!canCreate} onClick={handleCreateWidget}>Add to Dashboard</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}