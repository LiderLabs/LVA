import React, { useState, useMemo, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { runFormula, formatFormulaResult, suggestFormulaTitle } from "../utils/formulaEngine";
import "./FormulaPanel.css";

const GENERAL_FUNCTIONS = [
  { name: "sum", template: "sum(column)" },
  { name: "average", template: "average(column)" },
  { name: "min", template: "min(column)" },
  { name: "max", template: "max(column)" },
  { name: "weightedAverage", template: "weightedAverage(values, weights)" },
  { name: "growth", template: "growth(current, previous)" },
];

const PDMO_FUNCTIONS = [
  { name: "DebtToGDP", template: "DebtToGDP(debt, gdp)" },
  { name: "DebtServiceRatio", template: "DebtServiceRatio(debtService, revenue)" },
  { name: "AverageTimeToMaturity", template: "AverageTimeToMaturity(amounts, years)" },
  { name: "AverageTimeToRefixing", template: "AverageTimeToRefixing(amounts, yearsToRefix)" },
  { name: "WeightedAverageInterestRate", template: "WeightedAverageInterestRate(amounts, rates)" },
  { name: "PVofDebt", template: "PVofDebt(faceValues, rates, years)" },
  { name: "ExchangeRateExposure", template: "ExchangeRateExposure(foreignDebt, totalDebt)" },
  { name: "RefinancingRisk", template: "RefinancingRisk(amounts, yearsToMaturity, 1)" },
  { name: "ExternalDebtRatio", template: "ExternalDebtRatio(external, totalDebt)" },
  { name: "DomesticDebtRatio", template: "DomesticDebtRatio(domestic, totalDebt)" },
];

export default function FormulaPanel({ datasets, onClose, onCreateWidget, industry, initialExpression, initialDatasetId }) {
  const [datasetId, setDatasetId] = useState(initialDatasetId || datasets[0]?.id || "");
  const [expression, setExpression] = useState(initialExpression || "");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false); // true once the user edits the name themselves
  const textareaRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const activeDataset = datasets.find((d) => d.id === datasetId)?.dataset;

  // Recomputes on every keystroke -- this is the "live" part: the
  // result below updates as the formula is typed, before anything
  // is ever added to the dashboard.
  const result = useMemo(() => {
    if (!activeDataset) return { ok: true, value: null };
    return runFormula(expression, activeDataset, industry);
  }, [expression, activeDataset, industry]);

  // BI auto-naming: if the formula matches a known function and the
  // user hasn't typed their own name, suggest a business-meaningful
  // title automatically (e.g. "Debt-to-GDP Ratio" instead of the raw
  // expression). Still fully renameable at any point.
  useEffect(() => {
    if (titleTouched) return;
    const suggested = suggestFormulaTitle(expression);
    if (suggested) setTitle(suggested);
  }, [expression, titleTouched]);

  // Inserts text at the cursor position in the formula box, rather
  // than just appending to the end -- clicking a column name partway
  // through typing a function call should drop it right where the
  // cursor is.
  function insertAtCursor(snippet) {
    const el = textareaRef.current;
    if (!el) {
      setExpression((prev) => prev + snippet);
      return;
    }
    const start = el.selectionStart ?? expression.length;
    const end = el.selectionEnd ?? expression.length;
    const next = expression.slice(0, start) + snippet + expression.slice(end);
    setExpression(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + snippet.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function handleCreate() {
    if (!result.ok || result.value === null) return;
    onCreateWidget("kpi", {
      title: title || expression,
      value: formatFormulaResult(expression, result.value),
      delta: "",
      positive: true,
      formula: expression,
      datasetId,
    });
    onClose();
  }

  const functionList = industry === "pdmo" ? [...PDMO_FUNCTIONS, ...GENERAL_FUNCTIONS] : GENERAL_FUNCTIONS;

  return (
    <div className="import-overlay" onClick={onClose}>
      <div className="import-panel" onClick={(e) => e.stopPropagation()}>
        <div className="import-panel-header">
          <div className="import-title">Calculate a metric</div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="import-subtitle">Write a formula against an imported dataset — it recomputes as you type. Click a function or column below to insert it.</div>

        {datasets.length === 0 ? (
          <div className="formula-hint">Import a dataset first (top bar → Import data), then come back here to build a calculated metric from it.</div>
        ) : (
          <>
            <div className="field">
              <label className="label">Dataset</label>
              <select className="import-select" value={datasetId} onChange={(e) => setDatasetId(e.target.value)}>
                {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="label">Formula</label>
              <textarea
                ref={textareaRef}
                className="import-textarea"
                style={{ minHeight: 60 }}
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder={industry === "pdmo" ? "DebtToGDP(total_debt, gdp)" : "weightedAverage(interest_rate, principal)"}
              />
            </div>

            <div className="formula-chip-label">Columns (click to insert)</div>
            <div className="formula-chip-row">
              {activeDataset?.columns.map((c) => (
                <button key={c} type="button" className="formula-chip" onClick={() => insertAtCursor(c.replace(/[^a-zA-Z0-9_]/g, "_"))}>
                  {c}
                </button>
              ))}
            </div>

            <div className="formula-chip-label">Functions (click to insert)</div>
            <div className="formula-chip-row">
              {functionList.map((fn) => (
                <button key={fn.name} type="button" className="formula-chip formula-chip-fn" onClick={() => insertAtCursor(fn.template)} title={fn.template}>
                  {fn.name}()
                </button>
              ))}
            </div>

            <label className="label">Live result</label>
            <div className="formula-result">
              {result.ok ? (result.value === null ? "—" : formatFormulaResult(expression, result.value)) : "—"}
            </div>
            {!result.ok && <div className="import-error">{result.error}</div>}

            <div className="field">
              <label className="label">Metric name {suggestFormulaTitle(expression) && !titleTouched && <span className="formula-bi-tag">auto-named</span>}</label>
              <input
                className="input"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setTitleTouched(true); }}
                placeholder={expression || "New metric"}
              />
            </div>

            <div className="import-actions">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-amber" disabled={!result.ok || result.value === null} onClick={handleCreate}>
                Add as metric card
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
