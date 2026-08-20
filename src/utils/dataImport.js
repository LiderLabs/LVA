import Papa from "papaparse";
import * as XLSX from "xlsx";

export function parseFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "csv") return parseCsv(file);
  if (ext === "json") return parseJson(file);
  if (ext === "xlsx" || ext === "xls") return parseExcel(file);
  return Promise.reject(new Error(`Unsupported file type: .${ext}`));
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => resolve(toDataset(result.data)),
      error: reject,
    });
  });
}

function parseJson(file) {
  return file.text().then((text) => {
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : parsed.rows || parsed.data || [];
    return toDataset(rows);
  });
}

function parseExcel(file) {
  return file.arrayBuffer().then((buffer) => {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: null });
    return toDataset(rows);
  });
}

export function parsePastedText(text) {
  const result = Papa.parse(text.trim(), { header: true, dynamicTyping: true, skipEmptyLines: true });
  return toDataset(result.data);
}

function toDataset(rows) {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  return { columns, rows };
}

export function classifyColumns(dataset) {
  const numeric = [];
  const text = [];
  dataset.columns.forEach((col) => {
    const sample = dataset.rows.find((r) => r[col] !== null && r[col] !== undefined);
    if (sample && typeof sample[col] === "number") numeric.push(col);
    else text.push(col);
  });
  return { numeric, text };
}

/* ---------------- Mapping functions with Axis metadata ---------------- */

export function mapToSeries(dataset, { labelCol, valueCol, title, xLabel, yLabel }) {
  return {
    title: title || valueCol,
    xLabel: xLabel || labelCol,
    yLabel: yLabel || valueCol,
    data: dataset.rows.map((r) => ({ label: String(r[labelCol]), value: Number(r[valueCol]) || 0 })),
  };
}

export function mapToStacked(dataset, { labelCol, valueCols, title, xLabel, yLabel }) {
  return {
    title: title || "Stacked comparison",
    xLabel: xLabel || labelCol,
    yLabel: yLabel || "Total Value",
    data: dataset.rows.map((r) => {
      const row = { label: String(r[labelCol]) };
      valueCols.forEach((c) => (row[c] = Number(r[c]) || 0));
      return row;
    }),
    seriesKeys: valueCols.map((c) => ({ key: c, label: c })),
  };
}

export function mapToPie(dataset, { nameCol, valueCol, title }) {
  return {
    title: title || valueCol,
    data: dataset.rows.map((r) => ({ name: String(r[nameCol]), value: Number(r[valueCol]) || 0 })),
  };
}

export function mapToScatter(dataset, { xCol, yCol, title, xLabel, yLabel }) {
  return {
    title: title || `${yCol} vs ${xCol}`,
    xLabel: xLabel || xCol,
    yLabel: yLabel || yCol,
    data: dataset.rows.map((r) => ({ x: Number(r[xCol]) || 0, y: Number(r[yCol]) || 0 })),
  };
}

export function mapToRadar(dataset, { axisCol, valueCol, title }) {
  return {
    title: title || valueCol,
    data: dataset.rows.map((r) => ({ axis: String(r[axisCol]), value: Number(r[valueCol]) || 0 })),
  };
}

export function mapToTable(dataset, { nameCol, valueCol, changeCol, title }) {
  return {
    title: title || "Imported data",
    rows: dataset.rows.map((r) => ({
      name: String(r[nameCol]),
      value: r[valueCol],
      change: changeCol ? r[changeCol] : "",
    })),
  };
}

export function mapToKpi(dataset, { valueCol, title, aggregate = "sum" }) {
  const values = dataset.rows.map((r) => Number(r[valueCol]) || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const result = aggregate === "average" ? total / (values.length || 1) : total;
  return {
    title: title || `${aggregate} of ${valueCol}`,
    value: result.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    delta: "",
    positive: true,
  };
}

export function mapToAuction(dataset, { dateCol, securityCol, offeredCol, allottedCol, yieldCol, bidsCol, title }) {
  return {
    title: title || "Auction results",
    rows: dataset.rows.map((r) => {
      const offered = Number(r[offeredCol]) || 0;
      return {
        date: String(r[dateCol]),
        security: String(r[securityCol]),
        offered,
        allotted: Number(r[allottedCol]) || 0,
        yieldPct: Number(r[yieldCol]) || 0,
        bidToCover: bidsCol ? (Number(r[bidsCol]) || 0) / (offered || 1) : null,
      };
    }),
  };
}

export function mapToWaterfall(dataset, { labelCol, valueCol, title, xLabel, yLabel }) {
  return {
    title: title || "Movement",
    xLabel: xLabel || labelCol,
    yLabel: yLabel || valueCol,
    data: dataset.rows.map((r, i) => ({
      label: String(r[labelCol]),
      value: Number(r[valueCol]) || 0,
      isTotal: i === 0 || i === dataset.rows.length - 1,
    })),
  };
}

export function mapToScoreCard(dataset, { valueCol, targetCol, title }) {
  const sumOf = (col) => dataset.rows.reduce((a, r) => a + (Number(r[col]) || 0), 0);
  return {
    title: title || valueCol,
    value: sumOf(valueCol),
    target: sumOf(targetCol),
    unit: "",
  };
}

export function mapToFunnel(dataset, { labelCol, valueCol, title }) {
  return {
    title: title || "Funnel",
    data: dataset.rows.map((r) => ({ label: String(r[labelCol]), value: Number(r[valueCol]) || 0 })),
  };
}

export function mapToScoreboard(dataset, { valueCols, title }) {
  return {
    title: title || "Key metrics",
    metrics: valueCols.map((col) => {
      const values = dataset.rows.map((r) => Number(r[col]) || 0);
      const total = values.reduce((a, b) => a + b, 0);
      return { label: col, value: total.toLocaleString(undefined, { maximumFractionDigits: 1 }) };
    }),
  };
}

export const mapperFor = {
  kpi: mapToKpi,
  line: mapToSeries,
  area: mapToSeries,
  bar: mapToSeries,
  waterfall: mapToWaterfall,
  stackedBar: mapToStacked,
  pie: mapToPie,
  scatter: mapToScatter,
  radar: mapToRadar,
  funnel: mapToFunnel,
  scoreboard: mapToScoreboard,
  scorecard: mapToScoreCard,
  yieldCurve: mapToSeries,
  auction: mapToAuction,
  table: mapToTable,
};

function toCanonical(type, mapping) {
  switch (type) {
    case "line":
    case "area":
    case "bar":
    case "waterfall":
    case "funnel":
    case "yieldCurve":
      return { category: mapping.labelCol, value: mapping.valueCol, xLabel: mapping.xLabel, yLabel: mapping.yLabel };
    case "stackedBar":
    case "scoreboard":
      return { category: mapping.labelCol, values: mapping.valueCols, xLabel: mapping.xLabel, yLabel: mapping.yLabel };
    case "pie":
      return { category: mapping.nameCol, value: mapping.valueCol };
    case "radar":
      return { category: mapping.axisCol, value: mapping.valueCol };
    case "table":
      return { category: mapping.nameCol, value: mapping.valueCol, change: mapping.changeCol };
    case "scatter":
      return { value: mapping.xCol, value2: mapping.yCol, xLabel: mapping.xLabel, yLabel: mapping.yLabel };
    case "kpi":
      return { value: mapping.valueCol, aggregate: mapping.aggregate };
    case "scorecard":
      return { value: mapping.valueCol, value2: mapping.targetCol };
    default:
      return {};
  }
}

function fromCanonical(type, canonical, dataset) {
  const cls = classifyColumns(dataset);
  const fallbackCategory = cls.text[0] || dataset.columns[0];
  const fallbackValue = cls.numeric[0] || dataset.columns[0];
  const category = canonical.category || fallbackCategory;
  const value = canonical.value || canonical.values?.[0] || fallbackValue;

  switch (type) {
    case "line":
    case "area":
    case "bar":
    case "waterfall":
    case "funnel":
    case "yieldCurve":
      return { labelCol: category, valueCol: value, xLabel: canonical.xLabel || category, yLabel: canonical.yLabel || value };
    case "stackedBar":
    case "scoreboard":
      return { labelCol: category, valueCols: canonical.values || [value], xLabel: canonical.xLabel || category, yLabel: canonical.yLabel || "Values" };
    case "pie":
      return { nameCol: category, valueCol: value };
    case "radar":
      return { axisCol: category, valueCol: value };
    case "table":
      return { nameCol: category, valueCol: value, changeCol: canonical.change || "" };
    case "scatter":
      return { xCol: value, yCol: canonical.value2 || canonical.values?.[1] || cls.numeric[1] || fallbackValue, xLabel: canonical.xLabel || value, yLabel: canonical.yLabel || (canonical.value2 || fallbackValue) };
    case "kpi":
      return { valueCol: value, aggregate: canonical.aggregate || "sum" };
    case "scorecard":
      return { valueCol: value, targetCol: canonical.value2 || canonical.values?.[1] || cls.numeric[1] || fallbackValue };
    default:
      return {};
  }
}

export function remapMapping(oldType, newType, mapping, dataset) {
  const canonical = toCanonical(oldType, mapping);
  return fromCanonical(newType, canonical, dataset);
}

function aggregateColumn(rows, groupCol, valueCol) {
  const grouped = {};
  rows.forEach((r) => {
    const key = String(r[groupCol]);
    grouped[key] = (grouped[key] || 0) + (Number(r[valueCol]) || 0);
  });
  return Object.entries(grouped).map(([label, value]) => ({ label, value }));
}

function rowsForPath(dataset, hierarchy, path) {
  let rows = dataset.rows;
  path.forEach((val, i) => {
    rows = rows.filter((r) => String(r[hierarchy[i]]) === String(val));
  });
  return rows;
}

export function computeHierarchyLevel(dataset, mapping) {
  const { hierarchy, valueCol, level = 0, path = [], title } = mapping;
  const rows = rowsForPath(dataset, hierarchy, path);
  const col = hierarchy[level];
  return {
    title: title || col,
    xLabel: col,
    yLabel: valueCol,
    data: aggregateColumn(rows, col, valueCol),
    breadcrumb: ["All", ...path],
  };
}

export function computeHierarchyLevelPie(dataset, mapping) {
  const level = computeHierarchyLevel(dataset, mapping);
  return { ...level, data: level.data.map((d) => ({ name: d.label, value: d.value })) };
}

export function applyFilterToWidget(widget, filterText, datasets) {
  if (!filterText || !widget.source) return widget;
  const entry = datasets.find((d) => d.id === widget.source.datasetId);
  if (!entry) return widget;

  const needle = filterText.toLowerCase();
  const filteredRows = entry.dataset.rows.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(needle))
  );
  const filteredDataset = { ...entry.dataset, rows: filteredRows };

  if (widget.source.mapping.hierarchy) {
    const mapping = { ...widget.source.mapping, title: widget.data.title };
    const data = widget.type === "pie" ? computeHierarchyLevelPie(filteredDataset, mapping) : computeHierarchyLevel(filteredDataset, mapping);
    return { ...widget, data };
  }

  const mapper = mapperFor[widget.type];
  if (!mapper) return widget;
  const data = mapper(filteredDataset, { ...widget.source.mapping, title: widget.data.title });
  return { ...widget, data };
}

/* -----------------------------------------------------------------
   Deep Smart BI Graph Storyteller
----------------------------------------------------------------- */
export function generateWidgetStory(widget, dataset) {
  const title = widget.data?.title || "Chart";
  const type = widget.type;
  const datasetName = widget.datasetName || "Imported Dataset";
  const cols = dataset?.columns || [];

  let narrative = "";
  let purpose = "";
  let recommendations = [];

  if (type === "line" || type === "area" || type === "yieldCurve") {
    const pts = widget.data?.data || [];
    const xName = widget.data?.xLabel || "Period";
    const yName = widget.data?.yLabel || "Value";

    purpose = `Visualizes the trajectory and momentum of ${yName} over ${xName} from "${datasetName}".`;

    if (pts.length >= 2) {
      const first = pts[0].value;
      const last = pts[pts.length - 1].value;
      const diff = last - first;
      const pctChange = first !== 0 ? ((diff / Math.abs(first)) * 100).toFixed(1) : "0";
      const maxPt = [...pts].sort((a, b) => b.value - a.value)[0];
      const minPt = [...pts].sort((a, b) => a.value - b.value)[0];

      narrative = `This graph plots ${yName} across ${xName}. Overall, ${yName} has ${diff >= 0 ? "grown" : "contracted"} by ${Math.abs(pctChange)}% (from ${first.toLocaleString()} to ${last.toLocaleString()}). The peak occurred at ${maxPt.label} (${maxPt.value.toLocaleString()}), and the lowest point was at ${minPt.label} (${minPt.value.toLocaleString()}).`;

      const otherCols = cols.filter((c) => c !== xName && c !== yName);
      if (otherCols.length > 0) {
        recommendations.push({
          label: `Decompose by ${otherCols[0]}`,
          actionType: "bar",
          mapping: { labelCol: otherCols[0], valueCol: yName },
          description: `Compare how ${otherCols[0]} contributes to the ${yName} trends.`,
        });
      }
      recommendations.push({
        label: `View Waterfall Bridge`,
        actionType: "waterfall",
        mapping: { labelCol: xName, valueCol: yName },
        description: `Analyze the step-by-step net deltas between periods.`,
      });
    } else {
      narrative = `Tracks ${yName} across chronological segments in "${datasetName}".`;
    }
  } else if (type === "bar" || type === "stackedBar" || type === "waterfall") {
    const pts = widget.data?.data || [];
    const xName = widget.data?.xLabel || "Category";
    const yName = widget.data?.yLabel || "Amount";

    purpose = `Compares distribution across ${xName} categories to identify dominant contributors in "${datasetName}".`;

    if (pts.length > 0) {
      const sorted = [...pts].sort((a, b) => (b.value || 0) - (a.value || 0));
      const top = sorted[0];
      narrative = `The largest contributor is "${top.label || top.name}" with ${Number(top.value || 0).toLocaleString()}, leading the remaining categories.`;
      
      recommendations.push({
        label: `Convert to Pie Breakdown`,
        actionType: "pie",
        mapping: { nameCol: xName, valueCol: yName },
        description: `Inspect category percentage shares as a circular proportion.`,
      });
    } else {
      narrative = `Shows the comparative distribution across ${xName}.`;
    }
  } else if (type === "pie") {
    const pts = widget.data?.data || [];
    purpose = `Highlights portfolio composition and segment proportions within "${datasetName}".`;
    if (pts.length > 0) {
      const sorted = [...pts].sort((a, b) => b.value - a.value);
      const total = pts.reduce((a, b) => a + Number(b.value || 0), 0);
      const topPct = total > 0 ? ((sorted[0].value / total) * 100).toFixed(1) : 0;
      narrative = `"${sorted[0].name}" accounts for the primary share at ${topPct}% of the total volume.`;
    }
  } else if (type === "kpi" || type === "scorecard") {
    purpose = `Highlights critical high-level executive performance indicators and milestone thresholds.`;
    narrative = `Current metric reads ${widget.data?.value || "N/A"}.`;
  } else {
    purpose = `Structured analytical overview of ${title} from "${datasetName}".`;
    narrative = `Provides multi-dimensional visibility into key variables of the dataset.`;
  }

  return { narrative, purpose, recommendations };
}