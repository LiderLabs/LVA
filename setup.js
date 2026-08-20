import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = {
  // 1. Frame Component with Clean Drag Handling
  'src/components/Frame.jsx': `import React, { forwardRef } from "react";
import "./Frame.css";

export const Frame = forwardRef(function Frame(
  { children, selected, onClick, className = "", id, style, ...rest },
  ref
) {
  const classes = ["frame", onClick ? "clickable" : "", selected ? "selected" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} id={id} className={classes} onClick={onClick} style={style} {...rest}>
      <span className="frame-corner tl" />
      <span className="frame-corner tr" />
      <span className="frame-corner bl" />
      <span className="frame-corner br" />
      {children}
    </div>
  );
});

export function Eyebrow({ children }) {
  return <div className="eyebrow">{children}</div>;
}

export function Mark({ size = 22 }) {
  const width = Math.round(size * 2.3);
  return (
    <svg width={width} height={size} viewBox="0 0 54 22" role="img" aria-label="LVA">
      <rect x="0" y="0" width="54" height="22" rx="4" fill="var(--brand-blue)" />
      <text
        x="27"
        y="15.5"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontWeight="700"
        fontSize="11"
        letterSpacing="1"
        fill="var(--brand-white)"
      >
        LVA
      </text>
    </svg>
  );
}
`,

  // 2. Widgets Component with Robust Heights and Clear Axis Labels (No AI Story)
  'src/components/Widgets.jsx': `import React from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RadarShape,
  FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Gauge, TrendingUp, Activity, BarChart3, Layers, ArrowDownUp,
  PieChart as PieIcon, CircleDot, Radar as RadarIcon, Table2, Filter, LayoutGrid, Target, Gavel, Waves, ArrowLeft,
} from "lucide-react";
import { useChartColors } from "../styles/chartColors";
import { Eyebrow } from "./Frame";
import "./Widgets.css";

export const genericLabels = {
  kpi: "KPI",
  line: "Line chart",
  area: "Area chart",
  bar: "Bar chart",
  stackedBar: "Stacked bar",
  waterfall: "Waterfall",
  pie: "Pie chart",
  scatter: "Scatter plot",
  radar: "Radar chart",
  funnel: "Funnel",
  scoreboard: "Scoreboard",
  scorecard: "Score card",
  yieldCurve: "Line curve",
  auction: "Detail table",
  table: "Table",
};

export const defaultLineData = [
  { label: "Jan", value: 65 },
  { label: "Feb", value: 85 },
  { label: "Mar", value: 72 },
  { label: "Apr", value: 110 },
  { label: "May", value: 145 },
  { label: "Jun", value: 160 },
];

export const defaultBarData = [
  { label: "North", value: 54 },
  { label: "South", value: 82 },
  { label: "East", value: 68 },
  { label: "West", value: 95 },
  { label: "Central", value: 74 },
];

export const defaultAreaData = [
  { label: "Q1", value: 210 },
  { label: "Q2", value: 280 },
  { label: "Q3", value: 360 },
  { label: "Q4", value: 450 },
];

export const defaultPieData = [
  { name: "Enterprise", value: 45 },
  { name: "Mid-Market", value: 30 },
  { name: "Starter", value: 25 },
];

export const widgetDefs = {
  kpi: { label: "Metric", icon: Gauge, make: () => ({ title: "Total Revenue", value: "$814,580", delta: "+8.2%", positive: true }) },
  line: { label: "Trend", icon: TrendingUp, make: () => ({ title: "Revenue Trend", xLabel: "Month", yLabel: "Revenue ($k)", data: defaultLineData }) },
  area: { label: "Cumulative trend", icon: Activity, make: () => ({ title: "Cumulative Volume", xLabel: "Period", yLabel: "Total ($m)", data: defaultAreaData }) },
  bar: { label: "Comparison", icon: BarChart3, make: () => ({ title: "Regional Performance", xLabel: "Region", yLabel: "Sales ($k)", data: defaultBarData }) },
  stackedBar: { label: "Stacked comparison", icon: Layers, make: () => ({ title: "Channel Breakdown", xLabel: "Year", yLabel: "Revenue ($k)", data: [{ label: "2024", direct: 120, partner: 80 }, { label: "2025", direct: 150, partner: 95 }, { label: "2026", direct: 180, partner: 110 }], seriesKeys: [{ key: "direct", label: "Direct" }, { key: "partner", label: "Partner" }] }) },
  waterfall: { label: "Bridge / waterfall", icon: ArrowDownUp, make: () => ({ title: "Cash Flow Movement", xLabel: "Stage", yLabel: "Delta ($k)", data: [{ label: "Opening", value: 420, isTotal: true }, { label: "Inflow", value: 85 }, { label: "Operations", value: -45 }, { label: "Closing", value: 460, isTotal: true }] }) },
  pie: { label: "Breakdown", icon: PieIcon, make: () => ({ title: "Portfolio Allocation", data: defaultPieData }) },
  scatter: { label: "Correlation", icon: CircleDot, make: () => ({ title: "Volume vs Velocity", xLabel: "Cycle Time (Days)", yLabel: "Efficiency %", data: [{ x: 3, y: 45 }, { x: 5, y: 62 }, { x: 8, y: 78 }, { x: 12, y: 91 }] }) },
  radar: { label: "Risk profile", icon: RadarIcon, make: () => ({ title: "Operational Matrix", data: [{ axis: "Speed", value: 82 }, { axis: "Quality", value: 74 }, { axis: "Coverage", value: 68 }, { axis: "Support", value: 88 }] }) },
  funnel: { label: "Funnel", icon: Filter, make: () => ({ title: "Conversion Pipeline", data: [{ label: "Prospects", value: 500 }, { label: "Qualified", value: 320 }, { label: "Closed", value: 180 }] }) },
  scoreboard: { label: "Scoreboard", icon: LayoutGrid, make: () => ({ title: "Executive Scoreboard", metrics: [{ label: "MRR", value: "$151k" }, { label: "Churn", value: "2.5%" }, { label: "NPS", value: "72" }] }) },
  scorecard: { label: "Score card", icon: Target, make: () => ({ title: "Quarterly Target", value: 282, target: 300, unit: "k" }) },
  yieldCurve: { label: "Yield curve", icon: Waves, make: () => ({ title: "Benchmark Yield Curve", xLabel: "Tenor", yLabel: "Yield %", data: [{ label: "1M", value: 5.2 }, { label: "6M", value: 5.8 }, { label: "1Y", value: 6.4 }, { label: "5Y", value: 7.2 }, { label: "10Y", value: 7.9 }] }) },
  auction: { label: "Auction results", icon: Gavel, make: () => ({ title: "Auction Ledger", rows: [{ date: "2026-01-15", security: "91-day Bill", offered: 50, allotted: 48, yieldPct: 6.8, bidToCover: 1.4 }] }) },
  table: { label: "Ledger", icon: Table2, make: () => ({ title: "Summary Ledger", rows: [{ name: "Enterprise Plan", value: "$482,300", change: "+12.4%" }, { name: "Pro Plan", value: "$219,050", change: "+6.1%" }] }) },
};

function getTooltipStyle(c) {
  return {
    contentStyle: { background: c?.surfaceRaised || "#1e293b", border: "1px solid " + (c?.border || "#334155"), fontSize: 12, borderRadius: 4, color: c?.textPrimary || "#f8fafc" },
    labelStyle: { color: c?.textPrimary || "#f8fafc", fontWeight: 600 },
  };
}

export function KpiWidget({ data }) {
  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Metric"}</Eyebrow>
      <div className="kpi-row">
        <span className="kpi-value">{data?.value || "$814,580"}</span>
        {data?.delta && <span className={"kpi-delta " + (data?.positive ? "positive" : "negative")}>{data.delta}</span>}
      </div>
    </div>
  );
}

export function LineWidget({ data }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const chartData = (data?.data && data.data.length > 0) ? data.data : defaultLineData;

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Revenue Trend"}</Eyebrow>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <LineChart data={chartData} margin={{ top: 10, right: 14, left: -10, bottom: 18 }}>
            <CartesianGrid stroke={c?.border || "#1e293b"} vertical={false} />
            <XAxis dataKey="label" stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={{ stroke: c?.border || "#1e293b" }} tickLine={false} label={{ value: data?.xLabel || "Month", position: "insideBottom", offset: -8, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <YAxis stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: data?.yLabel || "Revenue ($k)", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke={c?.amber || "#ff9f0a"} strokeWidth={2.5} dot={{ r: 4, fill: c?.amber || "#ff9f0a" }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AreaWidget({ data }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const chartData = (data?.data && data.data.length > 0) ? data.data : defaultAreaData;

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Cumulative Volume"}</Eyebrow>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <AreaChart data={chartData} margin={{ top: 10, right: 14, left: -10, bottom: 18 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c?.amber || "#ff9f0a"} stopOpacity={0.4} />
                <stop offset="100%" stopColor={c?.amber || "#ff9f0a"} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={c?.border || "#1e293b"} vertical={false} />
            <XAxis dataKey="label" stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={{ stroke: c?.border || "#1e293b" }} tickLine={false} label={{ value: data?.xLabel || "Period", position: "insideBottom", offset: -8, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <YAxis stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: data?.yLabel || "Total ($m)", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke={c?.amber || "#ff9f0a"} strokeWidth={2.5} fill="url(#areaFill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function BarWidget({ data, onDrillDown, onDrillUp }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const chartData = (data?.data && data.data.length > 0) ? data.data : defaultBarData;

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Regional Performance"}</Eyebrow>
      {data?.breadcrumb && (
        <div className="breadcrumb-row">
          {data.breadcrumb.length > 1 && (
            <button className="breadcrumb-back" onClick={() => onDrillUp?.(data.breadcrumb.length - 2)}>
              <ArrowLeft size={11} />
            </button>
          )}
          {data.breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="breadcrumb-sep">/</span>}
              <span className={"breadcrumb-item " + (i === data.breadcrumb.length - 1 ? "current" : "")} onClick={() => i < data.breadcrumb.length - 1 && onDrillUp?.(i)}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <BarChart data={chartData} margin={{ top: 10, right: 14, left: -10, bottom: 18 }}>
            <CartesianGrid stroke={c?.border || "#1e293b"} vertical={false} />
            <XAxis dataKey="label" stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={{ stroke: c?.border || "#1e293b" }} tickLine={false} label={{ value: data?.xLabel || "Region", position: "insideBottom", offset: -8, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <YAxis stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: data?.yLabel || "Sales ($k)", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <Tooltip {...tooltipStyle} cursor={{ fill: c?.surfaceRaised || "#1e293b" }} />
            <Bar dataKey="value" fill={c?.info || "#38bdf8"} radius={[4, 4, 0, 0]} maxBarSize={34} isAnimationActive={false} style={{ cursor: onDrillDown ? "pointer" : "default" }} onClick={(entry) => onDrillDown?.(entry.label ?? entry.payload?.label)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StackedBarWidget({ data, onDrillDown }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const chartData = (data?.data && data.data.length > 0) ? data.data : widgetDefs.stackedBar.make().data;
  const seriesKeys = data?.seriesKeys || widgetDefs.stackedBar.make().seriesKeys;

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Channel Breakdown"}</Eyebrow>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <BarChart data={chartData} margin={{ top: 10, right: 14, left: -10, bottom: 18 }}>
            <CartesianGrid stroke={c?.border || "#1e293b"} vertical={false} />
            <XAxis dataKey="label" stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={{ stroke: c?.border || "#1e293b" }} tickLine={false} label={{ value: data?.xLabel || "Year", position: "insideBottom", offset: -8, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <YAxis stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: data?.yLabel || "Revenue ($k)", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <Tooltip {...tooltipStyle} cursor={{ fill: c?.surfaceRaised || "#1e293b" }} />
            {seriesKeys.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} stackId="stack" fill={(c?.series || [])[i % 7] || "#38bdf8"} radius={i === (seriesKeys.length - 1) ? [4, 4, 0, 0] : [0, 0, 0, 0]} maxBarSize={34} isAnimationActive={false} style={{ cursor: onDrillDown ? "pointer" : "default" }} onClick={(entry) => onDrillDown?.(entry.label ?? entry.payload?.label)} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function computeWaterfall(rows) {
  let running = 0;
  return (rows || []).map((row) => {
    if (row.isTotal) {
      const bar = { label: row.label, base: 0, delta: row.value, isTotal: true };
      running = row.value;
      return bar;
    }
    const start = running;
    running += row.value;
    const base = Math.min(start, running);
    const delta = Math.abs(row.value);
    return { label: row.label, base, delta, isTotal: false, positive: row.value >= 0 };
  });
}

export function WaterfallWidget({ data, onDrillDown }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const rows = computeWaterfall((data?.data && data.data.length > 0) ? data.data : widgetDefs.waterfall.make().data);

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Cash Flow Movement"}</Eyebrow>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <BarChart data={rows} margin={{ top: 10, right: 14, left: -10, bottom: 18 }}>
            <CartesianGrid stroke={c?.border || "#1e293b"} vertical={false} />
            <XAxis dataKey="label" stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 10.5 }} axisLine={{ stroke: c?.border || "#1e293b" }} tickLine={false} label={{ value: data?.xLabel || "Stage", position: "insideBottom", offset: -8, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <YAxis stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: data?.yLabel || "Delta ($k)", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <Tooltip {...tooltipStyle} cursor={{ fill: c?.surfaceRaised || "#1e293b" }} />
            <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="delta" stackId="w" radius={[3, 3, 3, 3]} maxBarSize={34} isAnimationActive={false} style={{ cursor: onDrillDown ? "pointer" : "default" }} onClick={(entry) => onDrillDown?.(entry.label ?? entry.payload?.label)}>
              {rows.map((r, i) => (
                <Cell key={i} fill={r.isTotal ? (c?.amber || "#ff9f0a") : r.positive ? (c?.good || "#3ddc84") : (c?.bad || "#ff3b30")} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PieWidget({ data, onDrillDown, onDrillUp }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const chartData = (data?.data && data.data.length > 0) ? data.data : defaultPieData;

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Portfolio Allocation"}</Eyebrow>
      {data?.breadcrumb && (
        <div className="breadcrumb-row">
          {data.breadcrumb.length > 1 && (
            <button className="breadcrumb-back" onClick={() => onDrillUp?.(data.breadcrumb.length - 2)}>
              <ArrowLeft size={11} />
            </button>
          )}
          {data.breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="breadcrumb-sep">/</span>}
              <span className={"breadcrumb-item " + (i === data.breadcrumb.length - 1 ? "current" : "")} onClick={() => i < data.breadcrumb.length - 1 && onDrillUp?.(i)}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="pie-row">
        <div className="pie-canvas">
          <ResponsiveContainer width="100%" height="100%" minHeight={130}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={36} outerRadius={58} paddingAngle={3} isAnimationActive={false} style={{ cursor: onDrillDown ? "pointer" : "default" }} onClick={(entry) => onDrillDown?.(entry.name)}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={(c?.series || [])[i % 7] || "#38bdf8"} stroke={c?.surface || "#10172a"} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="pie-legend">
          {chartData.map((d, i) => (
            <div key={d.name} className="pie-legend-item">
              <span className="pie-legend-swatch" style={{ background: (c?.series || [])[i % 7] || "#38bdf8" }} />
              {d.name} <span className="pie-legend-value">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScatterWidget({ data }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const chartData = (data?.data && data.data.length > 0) ? data.data : widgetDefs.scatter.make().data;

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Volume vs Velocity"}</Eyebrow>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <ScatterChart margin={{ top: 10, right: 14, left: -10, bottom: 18 }}>
            <CartesianGrid stroke={c?.border || "#1e293b"} />
            <XAxis type="number" dataKey="x" stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={{ stroke: c?.border || "#1e293b" }} tickLine={false} label={{ value: data?.xLabel || "Cycle Time", position: "insideBottom", offset: -8, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <YAxis type="number" dataKey="y" stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: data?.yLabel || "Efficiency", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: c?.amber || "#ff9f0a" }} />
            <Tooltip {...tooltipStyle} cursor={{ stroke: c?.border || "#1e293b" }} />
            <Scatter data={chartData} fill={c?.info || "#38bdf8"} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RadarWidget({ data }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const chartData = (data?.data && data.data.length > 0) ? data.data : widgetDefs.radar.make().data;

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Operational Matrix"}</Eyebrow>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <RadarChart data={chartData} outerRadius="75%">
            <PolarGrid stroke={c?.border || "#1e293b"} />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10.5, fill: c?.textSecondary || "#94a3b8" }} />
            <PolarRadiusAxis stroke={c?.border || "#1e293b"} tick={{ fontSize: 9, fill: c?.textMuted || "#64748b" }} />
            <RadarShape dataKey="value" stroke={c?.amber || "#ff9f0a"} fill={c?.amber || "#ff9f0a"} fillOpacity={0.35} isAnimationActive={false} />
            <Tooltip {...tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FunnelWidget({ data, onDrillDown }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const chartData = (data?.data && data.data.length > 0) ? data.data : widgetDefs.funnel.make().data;

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Conversion Pipeline"}</Eyebrow>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <FunnelChart>
            <Tooltip {...tooltipStyle} />
            <Funnel dataKey="value" data={chartData} isAnimationActive={false} style={{ cursor: onDrillDown ? "pointer" : "default" }} onClick={(entry) => onDrillDown?.(entry.label ?? entry.payload?.label)}>
              <LabelList position="right" dataKey="label" fill={c?.textPrimary || "#f8fafc"} stroke="none" fontSize={11} />
              {chartData.map((_, i) => (
                <Cell key={i} fill={(c?.series || [])[i % 7] || "#38bdf8"} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ScoreboardWidget({ data }) {
  const metrics = (data?.metrics && data.metrics.length > 0) ? data.metrics : widgetDefs.scoreboard.make().metrics;
  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Executive Scoreboard"}</Eyebrow>
      <div className="scoreboard-grid">
        {metrics.map((m) => (
          <div key={m.label} className="scoreboard-cell">
            <div className="scoreboard-label">{m.label}</div>
            <div className="scoreboard-value">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function scoreCardStatus(data) {
  const pct = data?.target ? Math.min(100, (data.value / data.target) * 100) : 0;
  const status = pct >= 90 ? "good" : pct >= 70 ? "warn" : "bad";
  return { pct, status };
}

export function ScoreCardWidget({ data }) {
  const targetData = data?.target ? data : widgetDefs.scorecard.make();
  const { pct, status } = scoreCardStatus(targetData);
  return (
    <div className="widget-inner-flex">
      <Eyebrow>{targetData.title || "Quarterly Target"}</Eyebrow>
      <div className="scorecard-row">
        <span className="scorecard-value">{targetData.value?.toLocaleString()}</span>
        <span className="scorecard-target">/ {targetData.target?.toLocaleString()} {targetData.unit || ""}</span>
      </div>
      <div className="scorecard-bar-track">
        <div className={"scorecard-bar-fill " + status} style={{ width: pct + "%" }} />
      </div>
      <div className={"scorecard-pct " + status}>{pct.toFixed(0)}% of target</div>
    </div>
  );
}

export function YieldCurveWidget({ data }) {
  const c = useChartColors();
  const tooltipStyle = getTooltipStyle(c);
  const chartData = (data?.data && data.data.length > 0) ? data.data : widgetDefs.yieldCurve.make().data;

  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Benchmark Yield Curve"}</Eyebrow>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          <AreaChart data={chartData} margin={{ top: 10, right: 14, left: -10, bottom: 18 }}>
            <defs>
              <linearGradient id="yieldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c?.info || "#38bdf8"} stopOpacity={0.35} />
                <stop offset="100%" stopColor={c?.info || "#38bdf8"} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={c?.border || "#1e293b"} vertical={false} />
            <XAxis dataKey="label" stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={{ stroke: c?.border || "#1e293b" }} tickLine={false} label={{ value: data?.xLabel || "Tenor", position: "insideBottom", offset: -8, fontSize: 10, fill: c?.info || "#38bdf8" }} />
            <YAxis stroke={c?.textMuted || "#64748b"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="%" label={{ value: data?.yLabel || "Rate %", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: c?.info || "#38bdf8" }} />
            <Tooltip {...tooltipStyle} formatter={(v) => [v + "%", "Yield"]} />
            <Area type="monotone" dataKey="value" stroke={c?.info || "#38bdf8"} strokeWidth={2.5} fill="url(#yieldFill)" dot={{ r: 3.5, fill: c?.info || "#38bdf8" }} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AuctionResultsWidget({ data }) {
  const rows = (data?.rows && data.rows.length > 0) ? data.rows : widgetDefs.auction.make().rows;
  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Auction Ledger"}</Eyebrow>
      <table className="widget-table auction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Security</th>
            <th>Offered</th>
            <th>Allotted</th>
            <th>Yield</th>
            <th>Bid/cover</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="name">{r.date}</td>
              <td className="name">{r.security}</td>
              <td className="value">{r.offered}</td>
              <td className="value">{r.allotted}</td>
              <td className="value">{r.yieldPct}%</td>
              <td className={"value " + (r.bidToCover != null && r.bidToCover < 1 ? "negative" : "")}>
                {r.bidToCover != null ? r.bidToCover.toFixed(1) + "x" : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableWidget({ data, onDrillDown }) {
  const rows = (data?.rows && data.rows.length > 0) ? data.rows : widgetDefs.table.make().rows;
  return (
    <div className="widget-inner-flex">
      <Eyebrow>{data?.title || "Summary Ledger"}</Eyebrow>
      <table className="widget-table">
        <tbody>
          {rows.map((r, i) => {
            const isNegative = String(r.change).startsWith("-");
            return (
              <tr key={i} className={onDrillDown ? "drillable-row" : ""} onClick={() => onDrillDown?.(r.name)}>
                <td className="name">{r.name}</td>
                <td className="value">{r.value}</td>
                <td className={"change " + (isNegative ? "negative" : "positive")}>{r.change}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const renderers = {
  kpi: KpiWidget,
  line: LineWidget,
  area: AreaWidget,
  bar: BarWidget,
  stackedBar: StackedBarWidget,
  waterfall: WaterfallWidget,
  pie: PieWidget,
  scatter: ScatterWidget,
  radar: RadarWidget,
  funnel: FunnelWidget,
  scoreboard: ScoreboardWidget,
  scorecard: ScoreCardWidget,
  yieldCurve: YieldCurveWidget,
  auction: AuctionResultsWidget,
  table: TableWidget,
};

export const drillableTypes = new Set(["bar", "stackedBar", "waterfall", "pie", "funnel", "table"]);
`,

  // 3. Clean Dashboard Component with Dataset Deletion, Direct Save & Smooth Repositioning
  'src/pages/Dashboard.jsx': `import React, { useState, useMemo, useRef, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Settings2, LogOut, DownloadCloud, ImageDown, FileDown, Download,
  Maximize, Minimize, Maximize2, Save, Eye, FolderKanban,
  Share2, Check, ArrowLeft, Mail, GripVertical, CheckCircle2, Trash2,
} from "lucide-react";
import { Frame, Eyebrow, Mark } from "../components/Frame";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { widgetDefs, genericLabels, renderers } from "../components/Widgets";
import DataImportPanel from "../components/DataImportPanel";
import DrillDownModal from "../components/DrillDownModal";
import PaletteChoiceModal from "../components/PaletteChoiceModal";
import { remapMapping, mapperFor } from "../utils/dataImport";
import { exportCanvasAsPng, exportCanvasAsPdf, exportWidgetDataAsCsv } from "../utils/exportUtils";
import { generateShareUrl } from "../utils/shareUtils";
import { saveProjectDashboard, loadProjectDashboard } from "../utils/projectStorage";
import DatasetViewModal from "../components/DatasetViewModal";
import * as store from "../utils/storage";
import "./Dashboard.css";

const ReactGridLayout = WidthProvider(Responsive);
const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const SPRING = { type: "spring", stiffness: 350, damping: 28 };

function defaultSize(type) {
  if (type === "kpi") return { w: 12, h: 3 };
  if (type === "scoreboard") return { w: 12, h: 4 };
  if (type === "scorecard") return { w: 6, h: 5 };
  if (type === "table") return { w: 6, h: 6 };
  return { w: 6, h: 8 };
}

function findFreeSlot(layout, w, h, cols = 12) {
  const occupied = new Set();
  layout.forEach((item) => {
    for (let yy = item.y; yy < item.y + item.h; yy++) {
      for (let xx = item.x; xx < item.x + item.w; xx++) {
        occupied.add(xx + "," + yy);
      }
    }
  });
  const maxY = layout.reduce((m, item) => Math.max(m, item.y + item.h), 0);
  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= cols - w; x++) {
      let fits = true;
      for (let yy = y; yy < y + h && fits; yy++) {
        for (let xx = x; xx < x + w; xx++) {
          if (occupied.has(xx + "," + yy)) { fits = false; break; }
        }
      }
      if (fits) return { x, y };
    }
  }
  return { x: 0, y: maxY };
}

export default function Dashboard({ user, goTo, project }) {
  const { theme, toggleTheme } = useTheme();

  // Load project-specific dashboard or initial fallback
  const initialDashboard = useMemo(() => {
    if (project?.id) {
      const savedProj = loadProjectDashboard(project.id);
      if (savedProj && savedProj.widgets?.length) return savedProj;
    }
    const session = store.loadCurrentSession("general");
    if (session && session.widgets?.length) return session;
    return null;
  }, [project]);

  const [widgets, setWidgets] = useState(() => {
    if (initialDashboard?.widgets?.length) return initialDashboard.widgets;
    return [
      { id: "w1", type: "kpi", data: widgetDefs.kpi.make(), isStarter: true },
      { id: "w2", type: "line", data: widgetDefs.line.make(), isStarter: true },
      { id: "w3", type: "bar", data: widgetDefs.bar.make(), isStarter: true },
    ];
  });

  const [layout, setLayout] = useState(() => {
    if (initialDashboard?.layout?.length) return initialDashboard.layout;
    return [
      { i: "w1", x: 0, y: 0, w: 12, h: 3 },
      { i: "w2", x: 0, y: 3, w: 6, h: 8 },
      { i: "w3", x: 6, y: 3, w: 6, h: 8 },
    ];
  });

  const [selectedId, setSelectedId] = useState(null);
  const [dashboardName, setDashboardName] = useState(() => initialDashboard?.name || (project ? (project.name + " Dashboard") : "Executive Dashboard"));
  const [showImport, setShowImport] = useState(false);
  const [paletteChoiceType, setPaletteChoiceType] = useState(null);
  const [importReuseContext, setImportReuseContext] = useState(null);
  const [drillDown, setDrillDown] = useState(null);
  const [datasets, setDatasets] = useState(() => initialDashboard?.datasets || []);

  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);
  const [viewingDatasetId, setViewingDatasetId] = useState(null);
  
  const [presenting, setPresenting] = useState(false);
  const [presentFocusId, setPresentFocusId] = useState(null);
  const [presentationOrder, setPresentationOrder] = useState(null);
  const dragThumbRef = useRef(null);
  const [expandedWidgetId, setExpandedWidgetId] = useState(null);

  const pageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const payload = { name: dashboardName, widgets, layout, datasets };
    store.saveCurrentSession("general", { dashboardId: "dash_main", ...payload });
    if (project?.id) saveProjectDashboard(project.id, payload);
  }, [widgets, layout, dashboardName, datasets, project]);

  const selected = useMemo(() => widgets.find((w) => w.id === selectedId), [widgets, selectedId]);

  function handleSaveClick() {
    if (project?.id) {
      saveProjectDashboard(project.id, { name: dashboardName, widgets, layout, datasets });
    }
    store.saveCurrentSession("general", { dashboardId: "dash_main", name: dashboardName, widgets, layout, datasets });
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  }

  function addLayoutEntry(id, type) {
    const { w, h } = defaultSize(type);
    setLayout((prev) => {
      const { x, y } = findFreeSlot(prev, w, h);
      return [...prev, { i: id, x, y, w, h }];
    });
  }

  function handlePaletteClick(key) {
    if (datasets.length === 0) {
      addWidget(key);
      return;
    }
    setPaletteChoiceType(key);
  }

  function resolvePaletteChoice(action) {
    const key = paletteChoiceType;
    setPaletteChoiceType(null);
    if (!key) return;

    if (action === "sample") {
      addWidget(key);
      return;
    }

    const preferredId = selected?.source?.datasetId;
    const entry = datasets.find((d) => d.id === preferredId) || datasets[datasets.length - 1];
    setImportReuseContext({ dataset: entry.dataset, datasetId: entry.id, name: entry.name, initialWidgetType: key });
    setShowImport(true);
  }

  function addWidgetFromDataset(entry) {
    setImportReuseContext({ dataset: entry.dataset, datasetId: entry.id, name: entry.name, initialWidgetType: "bar" });
    setShowImport(true);
  }

  function updateDatasetName(datasetId, newName) {
    setDatasets((prev) => prev.map((d) => (d.id === datasetId ? { ...d, name: newName } : d)));
  }

  function deleteDataset(datasetId) {
    if (!window.confirm("Remove this dataset?")) return;
    setDatasets((prev) => prev.filter((d) => d.id !== datasetId));
  }

  function changeWidgetType(id, newType) {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== id || w.type === newType) return w;
        if (w.source && !w.source.mapping?.hierarchy) {
          const entry = datasets.find((d) => d.id === w.source.datasetId);
          if (entry) {
            const newMapping = remapMapping(w.type, newType, w.source.mapping, entry.dataset);
            const mapper = mapperFor[newType] || mapperFor.bar;
            const data = mapper(entry.dataset, { ...newMapping, title: w.data?.title || genericLabels[newType] });
            return { ...w, type: newType, data, source: { datasetId: w.source.datasetId, mapping: newMapping } };
          }
        }
        return { ...w, type: newType, data: widgetDefs[newType]?.make() || w.data, source: null };
      })
    );
  }

  function addWidget(type, presetData, source = null, datasetName = null, chartName = null) {
    const id = "w_" + Date.now();
    const data = presetData || widgetDefs[type].make();
    if (chartName) data.title = chartName;

    const widgetWithMeta = { id, type, data, source, isStarter: false };

    setWidgets((prev) => {
      const hasOnlyStarters = prev.length > 0 && prev.every((w) => w.isStarter || ["w1", "w2", "w3"].includes(w.id));
      if (source && hasOnlyStarters) {
        setLayout([]);
        return [widgetWithMeta];
      }
      return [...prev, widgetWithMeta];
    });

    addLayoutEntry(id, type);
    setSelectedId(id);
  }

  function removeWidget(id) {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function renameSelected(title) {
    setWidgets((prev) => prev.map((w) => (w.id === selectedId ? { ...w, data: { ...w.data, title } } : w)));
  }

  function registerDataset(dataset, customName) {
    const id = "d_" + Date.now();
    const name = customName || ("Dataset " + (datasets.length + 1));
    setDatasets((prev) => [...prev, { id, name, dataset, groupId: "proj_" + Date.now() }]);
    return id;
  }

  function getShareLink() {
    return generateShareUrl({ name: dashboardName, widgets, layout, datasets });
  }

  function handleCopyShareLink() {
    const shareUrl = getShareLink();
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function handleGmailShare() {
    const shareUrl = getShareLink();
    const subject = encodeURIComponent("Interactive Dashboard: " + dashboardName);
    const body = encodeURIComponent("View this interactive dashboard here:\\n\\n" + shareUrl);
    window.open("https://mail.google.com/mail/?view=cm&fs=1&su=" + subject + "&body=" + body, "_blank");
  }

  function enterPresentation() {
    pageRef.current?.requestFullscreen?.();
    setPresentFocusId(null);
    setPresentationOrder(null);
    setPresenting(true);
  }

  function exitPresentation() {
    if (document.fullscreenElement) document.exitFullscreen();
    setPresenting(false);
    setPresentFocusId(null);
  }

  function handleThumbDragStart(id) {
    dragThumbRef.current = id;
  }

  function handleThumbDrop(targetId, currentOrderIds) {
    const draggedId = dragThumbRef.current;
    dragThumbRef.current = null;
    if (!draggedId || draggedId === targetId) return;
    const from = currentOrderIds.indexOf(draggedId);
    const to = currentOrderIds.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const next = [...currentOrderIds];
    next.splice(from, 1);
    next.splice(to, 0, draggedId);
    setPresentationOrder(next);
  }

  function renderWidgetContent(w) {
    const Renderer = renderers[w.type];
    if (!Renderer) return null;
    return (
      <Renderer
        data={w.data}
        onDrillDown={(category) => setDrillDown({ widget: w, category })}
      />
    );
  }

  const userInitial = user?.name ? user.name.trim()[0].toUpperCase() : "U";

  return (
    <div className={"dashboard-page " + (presenting ? "presenting" : "")} ref={pageRef} onClick={() => setShowPublishMenu(false)}>
      {!presenting && <div className="masthead-accent" />}

      {/* Top Bar */}
      {!presenting && (
        <div className="dashboard-topbar">
          <div className="dashboard-title-group">
            <button className="btn-icon" onClick={() => goTo("projects")} title="Back to My Projects">
              <ArrowLeft size={14} />
            </button>
            <Mark size={18} />
            <input
              className="dashboard-title-input"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
            />
          </div>

          <div className="dashboard-topbar-actions" onClick={(e) => e.stopPropagation()}>
            <ThemeToggle />

            <button className="btn btn-ghost hide-mobile" onClick={() => { setImportReuseContext(null); setShowImport(true); }}>
              <DownloadCloud size={13} className="icon-leading" />
              Import data
            </button>

            <button className="btn btn-ghost" onClick={enterPresentation} title="Presentation View">
              <Maximize size={13} />
            </button>

            <button className="btn btn-amber save-dash-btn" onClick={handleSaveClick} title="Save Dashboard to Project">
              {saveStatus ? <CheckCircle2 size={13} className="icon-leading" /> : <Save size={13} className="icon-leading" />}
              {saveStatus ? "Saved!" : "Save"}
            </button>

            {/* Publish Dropdown */}
            <div className="dropdown-wrapper">
              <button className={"btn " + (showPublishMenu ? "btn-amber" : "btn-ghost")} onClick={() => setShowPublishMenu((s) => !s)}>
                <Share2 size={13} className="icon-leading" />
                Publish
              </button>

              {showPublishMenu && (
                <div className="dropdown-popover publish-dropdown">
                  <div className="dropdown-header">Shareable Link</div>
                  <button className="dropdown-item link-copy-item" onClick={handleCopyShareLink}>
                    {copiedLink ? <Check size={14} color="var(--good)" /> : <Share2 size={14} />}
                    <span>{copiedLink ? "Link Copied!" : "Copy Interactive Link"}</span>
                  </button>

                  <div className="dropdown-header" style={{ marginTop: 6 }}>Email Sharing</div>
                  <button className="dropdown-item" onClick={handleGmailShare}>
                    <Mail size={14} color="var(--amber)" />
                    <span>Share via Gmail / Email</span>
                  </button>

                  <div className="dropdown-divider" />
                  <div className="dropdown-header">Export Files</div>
                  <button className="dropdown-item" onClick={() => exportCanvasAsPng(canvasRef.current, dashboardName + ".png")}>
                    <ImageDown size={13} />
                    <span>Export PNG Image</span>
                  </button>
                  <button className="dropdown-item" onClick={() => exportCanvasAsPdf(canvasRef.current, dashboardName + ".pdf")}>
                    <FileDown size={13} />
                    <span>Export PDF Document</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <button className="google-avatar-btn" onClick={() => setShowProfileDrawer(true)} title="Account Profile">
              <div className="google-avatar-circle">{userInitial}</div>
            </button>
          </div>
        </div>
      )}

      {/* Slide-Out Profile Drawer */}
      <AnimatePresence>
        {showProfileDrawer && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileDrawer(false)}
            />
            <motion.div
              className="profile-slide-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING}
            >
              <div className="drawer-header">
                <span className="drawer-title">Profile & Settings</span>
                <button className="btn-icon" onClick={() => setShowProfileDrawer(false)}>
                  <X size={14} />
                </button>
              </div>

              <div className="profile-hero-card">
                <div className="profile-large-avatar">{userInitial}</div>
                <div className="profile-main-name">{user?.name || "Workspace User"}</div>
                <div className="profile-main-email">{user?.email || "user@visualization.io"}</div>
              </div>

              <div className="drawer-menu-list">
                <div className="drawer-menu-item" onClick={() => { setShowProfileDrawer(false); goTo("projects"); }}>
                  <FolderKanban size={15} color="var(--amber)" />
                  <span>My Data Projects</span>
                </div>
                <div className="drawer-menu-item" onClick={handleGmailShare}>
                  <Mail size={15} color="var(--info)" />
                  <span>Share Dashboard via Gmail</span>
                </div>
                <div className="drawer-menu-item" onClick={toggleTheme}>
                  <ThemeToggle />
                  <span>Toggle Theme ({theme === "dark" ? "Dark" : "Light"})</span>
                </div>
              </div>

              <div className="drawer-footer">
                <button className="btn btn-ghost btn-block btn-danger" onClick={() => { setShowProfileDrawer(false); goTo("landing"); }}>
                  <LogOut size={13} className="icon-leading" />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="dashboard-body">
        {!presenting && (
          <div className="dashboard-sidebar hide-mobile">
            <Eyebrow>Visualizations</Eyebrow>
            <div className="widget-palette">
              {Object.entries(widgetDefs).map(([key, def]) => {
                const Icon = def.icon;
                return (
                  <button key={key} className="widget-palette-item" onClick={() => handlePaletteClick(key)}>
                    <Icon size={15} color="var(--amber)" />
                    {genericLabels[key] || def.label}
                    <Plus size={13} className="widget-palette-plus" />
                  </button>
                );
              })}
            </div>

            <div className="suggestion-block">
              <Eyebrow>Project Datasets ({datasets.length})</Eyebrow>
              {datasets.length === 0 ? (
                <div className="inspector-empty">No datasets yet. Click 'Import data' above.</div>
              ) : (
                datasets.map((d) => (
                  <div key={d.id} className="datasource-item">
                    <div className="datasource-row">
                      <span className="dataset-chip">{d.name}</span>
                      <button className="btn-icon" onClick={() => addWidgetFromDataset(d)} title="Add chart from this dataset">
                        <Plus size={11} />
                      </button>
                      <button className="btn-icon" onClick={() => setViewingDatasetId(d.id)} title="View table">
                        <Eye size={11} />
                      </button>
                      <button className="btn-icon" onClick={() => deleteDataset(d.id)} title="Delete dataset">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Dashboard Canvas */}
        <div className="dashboard-canvas styled-workspace" ref={canvasRef}>
          {presenting ? (
            <div className="presentation-view-container">
              <div className="presentation-top-controls">
                <span className="presentation-brand-title"><Mark size={16} /> {dashboardName}</span>
                <button className="btn-icon" onClick={exitPresentation}><Minimize size={14} /></button>
              </div>

              {(() => {
                const orderIds = presentationOrder || widgets.map((w) => w.id);
                const ordered = orderIds.map((id) => widgets.find((w) => w.id === id)).filter(Boolean);
                const focused = ordered.find((w) => w.id === presentFocusId);

                return focused ? (
                  <div className="presentation-focus-layout">
                    <div className="presentation-thumbnails">
                      <div className="sidebar-subhead">Charts (Drag to Reorder)</div>
                      {ordered.map((w) => (
                        <motion.div
                          key={w.id}
                          layout
                          transition={SPRING}
                          draggable
                          onDragStart={() => handleThumbDragStart(w.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleThumbDrop(w.id, orderIds)}
                          className={"presentation-thumbnail " + (focused.id === w.id ? "active" : "")}
                          onClick={() => setPresentFocusId(w.id)}
                        >
                          <span className="presentation-thumb-handle"><GripVertical size={11} /></span>
                          <div className="thumb-content-scale">
                            {renderWidgetContent(w)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="presentation-main">
                      <button className="shared-unfocus-btn" onClick={() => setPresentFocusId(null)}>
                        <Minimize size={12} style={{ marginRight: 6 }} /> Back to All Widgets
                      </button>
                      <div className="presentation-fullbleed-focus">
                        {renderWidgetContent(focused)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="presentation-wall">
                    {ordered.map((w) => (
                      <div key={w.id} className="presentation-wall-card" onClick={() => setPresentFocusId(w.id)}>
                        <button className="widget-enlarge-corner-btn" title="Focus view"><Maximize2 size={13} /></button>
                        {renderWidgetContent(w)}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <ReactGridLayout
              className="widget-grid-layout"
              layouts={{ lg: layout }}
              breakpoints={GRID_BREAKPOINTS}
              cols={GRID_COLS}
              rowHeight={28}
              margin={[14, 14]}
              compactType="vertical"
              isDraggable={true}
              isResizable={true}
              draggableCancel=".widget-controls, .widget-controls button, input, select, textarea, button"
              onLayoutChange={(curr) => setLayout(curr)}
            >
              {widgets.map((w) => (
                <Frame
                  key={w.id}
                  id={"widget-" + w.id}
                  selected={selectedId === w.id}
                  onClick={() => setSelectedId(w.id)}
                  className="grid-frame"
                >
                  <div className="widget-controls">
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setExpandedWidgetId(w.id); }} title="Enlarge Chart">
                      <Maximize2 size={12} />
                    </button>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); exportWidgetDataAsCsv(w); }} title="Export CSV">
                      <Download size={12} />
                    </button>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); removeWidget(w.id); }} title="Delete">
                      <X size={12} />
                    </button>
                  </div>
                  {renderWidgetContent(w)}
                </Frame>
              ))}
            </ReactGridLayout>
          )}

          {!presenting && widgets.length === 0 && (
            <div className="empty-canvas">Canvas is clear. Add a widget from the left or import a dataset.</div>
          )}
        </div>

        {/* Inspector */}
        {!presenting && (
          <div className="dashboard-inspector hide-mobile">
            <Eyebrow><Settings2 size={11} className="icon-leading" /> Inspector</Eyebrow>
            {selected ? (
              <div className="inspector-fields">
                <div className="field">
                  <label className="label">Chart Title</label>
                  <input className="input" value={selected.data?.title || ""} onChange={(e) => renameSelected(e.target.value)} />
                </div>

                <div className="field">
                  <label className="label">Switch Chart Type</label>
                  <div className="inspector-chart-switch-grid">
                    {Object.entries(genericLabels).map(([typeKey, typeLabel]) => (
                      <button
                        key={typeKey}
                        className={"inspector-type-pill " + (selected.type === typeKey ? "active" : "")}
                        onClick={() => changeWidgetType(selected.id, typeKey)}
                        title={"Convert to " + typeLabel}
                      >
                        {typeLabel}
                      </button>
                    ))}
                  </div>
                  <div className="inspector-hint">Changes chart type instantly using the same dataset.</div>
                </div>

                <button className="btn btn-ghost btn-danger" onClick={() => removeWidget(selected.id)}>
                  Remove Widget
                </button>
              </div>
            ) : (
              <div className="inspector-empty">Select any widget to customize its title, convert to another chart type, or inspect data sources.</div>
            )}
          </div>
        )}
      </div>

      {/* Full-Screen Enlargement Modal */}
      {expandedWidgetId && (() => {
        const w = widgets.find((x) => x.id === expandedWidgetId);
        if (!w) return null;
        return (
          <div className="import-overlay" onClick={() => setExpandedWidgetId(null)}>
            <div className="widget-full-screen-shell" onClick={(e) => e.stopPropagation()}>
              <button className="widget-full-screen-close" onClick={() => setExpandedWidgetId(null)}>
                <X size={15} />
              </button>
              <div className="widget-full-screen-content">
                {renderWidgetContent(w)}
              </div>
            </div>
          </div>
        );
      })()}

      {showImport && (
        <DataImportPanel
          onClose={() => { setShowImport(false); setImportReuseContext(null); }}
          onCreateWidget={addWidget}
          onDatasetReady={registerDataset}
          onUpdateDatasetName={updateDatasetName}
          industry="general"
          existingDataset={importReuseContext?.dataset}
          existingDatasetId={importReuseContext?.datasetId}
          existingDatasetName={importReuseContext?.name}
          initialWidgetType={importReuseContext?.initialWidgetType}
        />
      )}

      {paletteChoiceType && (
        <PaletteChoiceModal
          typeLabel={genericLabels[paletteChoiceType] || paletteChoiceType}
          canDuplicate={Boolean(selected?.source)}
          duplicateFromTitle={selected?.data?.title}
          onChoose={resolvePaletteChoice}
          onClose={() => setPaletteChoiceType(null)}
        />
      )}

      {drillDown && (
        <DrillDownModal
          widget={drillDown.widget}
          category={drillDown.category}
          datasets={datasets}
          onClose={() => setDrillDown(null)}
        />
      )}

      {viewingDatasetId && (() => {
        const entry = datasets.find((d) => d.id === viewingDatasetId);
        if (!entry) return null;
        return (
          <DatasetViewModal
            dataset={entry.dataset}
            datasetName={entry.name}
            onClose={() => setViewingDatasetId(null)}
            onSave={(newDs) => {
              setDatasets((prev) => prev.map((d) => (d.id === entry.id ? { ...d, dataset: newDs } : d)));
            }}
          />
        );
      })()}
    </div>
  );
}
`,

  // 4. Shared Dashboard with Executive Canvas PNG Export and Full-Screen Scaling
  'src/pages/SharedDashboard.jsx': `import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize, LayoutGrid, MonitorPlay, Share2, Check, ImageDown, FileDown, GripVertical } from "lucide-react";
import { renderers } from "../components/Widgets";
import { exportCanvasAsPng, exportCanvasAsPdf } from "../utils/exportUtils";
import DrillDownModal from "../components/DrillDownModal";
import "./SharedDashboard.css";

const SPRING = { type: "spring", stiffness: 350, damping: 28 };

export default function SharedDashboard({ data }) {
  const [viewMode, setViewMode] = useState("interactive");
  const [focusId, setFocusId] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [presentationOrder, setPresentationOrder] = useState(null);
  const [drillDown, setDrillDown] = useState(null);
  const canvasRef = useRef(null);
  const dragThumbRef = useRef(null);

  const widgets = data?.widgets || [];
  const datasets = data?.datasets || [];
  const dashboardName = data?.name || "LVA Dashboard";

  const orderIds = presentationOrder || widgets.map((w) => w.id);
  const orderedWidgets = orderIds.map((id) => widgets.find((w) => w.id === id)).filter(Boolean);
  const focusedWidget = orderedWidgets.find((w) => w.id === focusId);

  function handleCopyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function handleThumbDragStart(id) {
    dragThumbRef.current = id;
  }

  function handleThumbDrop(targetId) {
    const draggedId = dragThumbRef.current;
    dragThumbRef.current = null;
    if (!draggedId || draggedId === targetId) return;
    const from = orderIds.indexOf(draggedId);
    const to = orderIds.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const next = [...orderIds];
    next.splice(from, 1);
    next.splice(to, 0, draggedId);
    setPresentationOrder(next);
  }

  function renderWidget(w) {
    const Renderer = renderers[w.type];
    if (!Renderer) return null;
    return (
      <Renderer
        data={w.data}
        onDrillDown={(category) => setDrillDown({ widget: w, category })}
      />
    );
  }

  const kpiWidgets = widgets.filter((w) => w.type === "kpi" || w.type === "scoreboard" || w.type === "scorecard");
  const chartWidgets = widgets.filter((w) => w.type !== "kpi" && w.type !== "scoreboard" && w.type !== "scorecard");

  return (
    <div className="shared-canvas-root" ref={canvasRef}>
      {/* Hidden Small Side Drawer Trigger */}
      <div className="shared-hidden-drawer-trigger" onClick={() => setShowDrawer((s) => !s)} title="Layout & Sharing Options">
        <LayoutGrid size={15} />
      </div>

      {/* Slide-In Options Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              className="shared-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              className="shared-options-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING}
            >
              <div className="shared-drawer-header">
                <span>Display & Sharing</span>
                <button className="btn-icon" onClick={() => setShowDrawer(false)}>✕</button>
              </div>

              <div className="drawer-sub-label">View Layout</div>
              <div className="shared-drawer-options">
                <button
                  className={"shared-drawer-opt " + (viewMode === "interactive" ? "active" : "")}
                  onClick={() => { setViewMode("interactive"); setShowDrawer(false); }}
                >
                  <MonitorPlay size={15} />
                  <div>
                    <div className="opt-title">Interactive Focus Mode</div>
                    <div className="opt-desc">Full-screen grid with click-to-enlarge & reorderable live sidebar.</div>
                  </div>
                </button>

                <button
                  className={"shared-drawer-opt " + (viewMode === "canvas" ? "active" : "")}
                  onClick={() => { setViewMode("canvas"); setFocusId(null); setShowDrawer(false); }}
                >
                  <LayoutGrid size={15} />
                  <div>
                    <div className="opt-title">Executive Canvas Layout</div>
                    <div className="opt-desc">Clean, high-impact overview with top KPI highlights and executive chart cards.</div>
                  </div>
                </button>
              </div>

              <div className="drawer-sub-label" style={{ marginTop: 24 }}>Share & Export</div>
              <div className="shared-drawer-options">
                <button className="shared-drawer-opt" onClick={handleCopyShareLink}>
                  {copiedLink ? <Check size={15} color="var(--good)" /> : <Share2 size={15} />}
                  <div>
                    <div className="opt-title">{copiedLink ? "Link Copied!" : "Forward / Copy Share Link"}</div>
                    <div className="opt-desc">Copy this interactive dashboard link to forward to colleagues.</div>
                  </div>
                </button>

                <button className="shared-drawer-opt" onClick={() => exportCanvasAsPng(canvasRef.current, dashboardName + ".png")}>
                  <ImageDown size={15} />
                  <div>
                    <div className="opt-title">Download PNG Image</div>
                    <div className="opt-desc">Save full high-resolution image of this dashboard.</div>
                  </div>
                </button>

                <button className="shared-drawer-opt" onClick={() => exportCanvasAsPdf(canvasRef.current, dashboardName + ".pdf")}>
                  <FileDown size={15} />
                  <div>
                    <div className="opt-title">Download PDF Document</div>
                    <div className="opt-desc">Export print-ready document.</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODE 1: Interactive View */}
      {viewMode === "interactive" && (
        <div className="shared-canvas-stage">
          {focusedWidget ? (
            <div className="shared-focus-layout">
              <div className="shared-live-thumbnails">
                <div className="sidebar-subhead">Charts (Drag to Reorder)</div>
                {orderedWidgets.map((w) => (
                  <motion.div
                    key={w.id}
                    layout
                    transition={SPRING}
                    draggable
                    onDragStart={() => handleThumbDragStart(w.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleThumbDrop(w.id)}
                    className={"shared-live-thumb-card " + (focusedWidget.id === w.id ? "active" : "")}
                    onClick={() => setFocusId(w.id)}
                  >
                    <div className="thumb-drag-handle"><GripVertical size={12} /></div>
                    <div className="thumb-content-scale">
                      {renderWidget(w)}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="shared-main-focus-stage">
                <button className="shared-unfocus-btn" onClick={() => setFocusId(null)}>
                  <Minimize size={13} style={{ marginRight: 6 }} />
                  Back to All Widgets
                </button>
                <div className="shared-focus-card">
                  {renderWidget(focusedWidget)}
                </div>
              </div>
            </div>
          ) : (
            <div className="shared-all-widgets-grid" data-count={orderedWidgets.length}>
              {orderedWidgets.map((w) => (
                <div key={w.id} className="shared-widget-card" onClick={() => setFocusId(w.id)}>
                  <button className="shared-card-expand-btn" title="Focus this chart">
                    <Maximize2 size={13} />
                  </button>
                  {renderWidget(w)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: LVA Executive Canvas Layout */}
      {viewMode === "canvas" && (
        <div className="lva-canvas-container">
          <div className="lva-dashboard-title">{dashboardName}</div>

          {kpiWidgets.length > 0 && (
            <div className="lva-kpi-ribbon">
              {kpiWidgets.map((w, i) => (
                <div key={w.id} className={"lva-kpi-card banner-" + (i % 4)}>
                  {renderWidget(w)}
                </div>
              ))}
            </div>
          )}

          <div className="lva-charts-grid" data-count={chartWidgets.length}>
            {(chartWidgets.length > 0 ? chartWidgets : widgets).map((w) => (
              <div key={w.id} className="lva-chart-card">
                {renderWidget(w)}
              </div>
            ))}
          </div>
        </div>
      )}

      {drillDown && (
        <DrillDownModal
          widget={drillDown.widget}
          category={drillDown.category}
          datasets={datasets}
          onClose={() => setDrillDown(null)}
        />
      )}
    </div>
  );
}
`,

  // 5. Shared Dashboard CSS with Dynamic Grid Scaling for 1, 2, or Multiple Widgets
  'src/pages/SharedDashboard.css': `.shared-canvas-root {
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  padding: 16px;
  background: var(--bg);
  position: relative;
  font-family: var(--font-sans);
}

.shared-hidden-drawer-trigger {
  position: fixed;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  transition: all 140ms ease;
}

.shared-hidden-drawer-trigger:hover {
  color: var(--amber);
  border-color: var(--amber);
  transform: scale(1.08);
}

.shared-drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
}

.shared-options-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  max-width: 88vw;
  background: var(--surface);
  border-left: 1px solid var(--border-strong);
  z-index: 160;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.4);
}

.shared-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.drawer-sub-label {
  font-size: 10.5px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--amber);
  margin-bottom: 8px;
}

.shared-drawer-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shared-drawer-opt {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
  transition: all 140ms ease;
}

.shared-drawer-opt:hover,
.shared-drawer-opt.active {
  border-color: var(--amber);
  color: var(--text-primary);
}

.opt-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.opt-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
}

.shared-canvas-stage {
  width: 100%;
  height: 100%;
}

/* Full Screen Dynamic Grid for Shared View */
.shared-all-widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 16px;
  width: 100%;
  min-height: calc(100vh - 36px);
}

.shared-all-widgets-grid[data-count="1"] {
  grid-template-columns: 1fr;
}

.shared-all-widgets-grid[data-count="2"] {
  grid-template-columns: 1fr 1fr;
}

.shared-all-widgets-grid[data-count="3"] {
  grid-template-columns: repeat(3, 1fr);
}

.shared-widget-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 16px 18px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  flex: 1;
  transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
}

.shared-widget-card:hover {
  border-color: var(--amber);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.shared-widget-card > div {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.shared-card-expand-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0.6;
}

.shared-widget-card:hover .shared-card-expand-btn {
  opacity: 1;
  color: var(--text-primary);
}

/* Interactive Focus View */
.shared-focus-layout {
  display: flex;
  gap: 18px;
  height: calc(100vh - 32px);
  width: 100%;
  box-sizing: border-box;
}

.shared-live-thumbnails {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-subhead {
  font-size: 10.5px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.shared-live-thumb-card {
  height: 170px;
  min-height: 170px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 12px;
  position: relative;
  cursor: grab;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.shared-live-thumb-card:hover {
  border-color: var(--amber);
}

.shared-live-thumb-card.active {
  border-color: var(--amber);
  box-shadow: 0 0 0 2px var(--amber);
}

.thumb-drag-handle {
  position: absolute;
  top: 6px;
  right: 6px;
  color: var(--text-muted);
  z-index: 10;
}

.thumb-content-scale {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.thumb-content-scale > div {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.thumb-content-scale .chart-box {
  height: 110px;
  min-height: 110px;
}

.shared-main-focus-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.shared-unfocus-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 10px;
  align-self: flex-start;
}

.shared-unfocus-btn:hover {
  border-color: var(--amber);
}

.shared-focus-card {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.shared-focus-card > div {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.shared-focus-card .kpi-value {
  font-size: 64px;
}

/* LVA Executive Canvas Layout */
.lva-canvas-container {
  width: 100%;
  min-height: calc(100vh - 36px);
  padding: 12px 16px 40px;
  box-sizing: border-box;
}

.lva-dashboard-title {
  font-family: var(--font-voice);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.lva-kpi-ribbon {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.lva-kpi-card {
  border-radius: 8px;
  padding: 20px 22px;
  color: #ffffff !important;
  display: flex;
  flex-direction: column;
}

.lva-kpi-card .eyebrow,
.lva-kpi-card .kpi-value,
.lva-kpi-card .kpi-delta {
  color: #ffffff !important;
}

.lva-kpi-card.banner-0 { background: linear-gradient(135deg, #1e3a8a, #2563eb); }
.lva-kpi-card.banner-1 { background: linear-gradient(135deg, #0284c7, #38bdf8); }
.lva-kpi-card.banner-2 { background: linear-gradient(135deg, #7c3aed, #a855f7); }
.lva-kpi-card.banner-3 { background: linear-gradient(135deg, #be123c, #f43f5e); }

.lva-charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 18px;
  min-height: 480px;
}

.lva-charts-grid[data-count="1"] {
  grid-template-columns: 1fr;
}

.lva-charts-grid[data-count="2"] {
  grid-template-columns: 1fr 1fr;
}

.lva-chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 22px 24px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.lva-chart-card > div {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .shared-all-widgets-grid, .lva-charts-grid {
    grid-template-columns: 1fr !important;
  }
  .shared-focus-layout {
    flex-direction: column;
  }
  .shared-live-thumbnails {
    width: 100%;
    flex-direction: row;
    height: 160px;
  }
}
`,

  // 6. Smart App Router (Direct Dashboard Loading for Saved Projects)
  'src/App.jsx': `import React, { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProjectsHome from "./pages/ProjectsHome";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import SharedDashboard from "./pages/SharedDashboard";
import { ThemeProvider } from "./context/ThemeContext";
import { IndustryProvider } from "./context/IndustryContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { getCurrentUser, logoutUser } from "./utils/auth";
import { decodeSharedData } from "./utils/shareUtils";
import { loadProjectDashboard } from "./utils/projectStorage";

export default function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [page, setPage] = useState(() => {
    if (window.location.hash.includes("#share=")) return "shared";
    return getCurrentUser() ? "projects" : "landing";
  });
  const [currentProject, setCurrentProject] = useState(null);
  const [sharedData, setSharedData] = useState(() => decodeSharedData(window.location.hash));

  useEffect(() => {
    function handleHash() {
      if (window.location.hash.includes("#share=")) {
        const decoded = decodeSharedData(window.location.hash);
        if (decoded) {
          setSharedData(decoded);
          setPage("shared");
        }
      }
    }
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function goTo(name) {
    if (name === "landing" || name === "logout") {
      logoutUser();
      setUser(null);
      setPage("landing");
      return;
    }
    setPage(name);
  }

  function handleAuthenticated(userInfo) {
    setUser(userInfo);
    setPage("projects");
  }

  // Direct Project Opening (Skips intermediary page if dashboard was already saved)
  function handleOpenProject(project) {
    setCurrentProject(project);
    const existingDash = loadProjectDashboard(project.id);
    if (existingDash && existingDash.widgets?.length) {
      setPage("dashboard");
    } else {
      setPage("project-detail");
    }
  }

  function handleOpenDashboard() {
    setPage("dashboard");
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <IndustryProvider>
          {page === "shared" && <SharedDashboard data={sharedData} />}
          {page === "landing" && <Landing goTo={goTo} />}
          {page === "login" && <Login goTo={goTo} onAuthenticated={handleAuthenticated} />}
          {page === "signup" && <Signup goTo={goTo} onAuthenticated={handleAuthenticated} />}
          {page === "projects" && <ProjectsHome user={user} goTo={goTo} onOpenProject={handleOpenProject} />}
          {page === "project-detail" && (
            <ProjectDetail project={currentProject} goTo={goTo} onOpenDashboard={handleOpenDashboard} />
          )}
          {page === "dashboard" && <Dashboard user={user} goTo={goTo} project={currentProject} />}
        </IndustryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
`
};

console.log("Applying all 9 fixes...");
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log("✔ Overwritten: " + relPath);
}
console.log("\n🎉 ALL 9 CORRECTIONS SUCCESSFULLY APPLIED!");