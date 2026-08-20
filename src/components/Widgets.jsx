import React from "react";
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
