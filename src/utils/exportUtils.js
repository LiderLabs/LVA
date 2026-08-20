import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";

// Exclude all navigation buttons, drawers, overlays, and controls from exports
const filterExportNodes = (node) => {
  if (!node || !node.classList) return true;
  const excludedClasses = [
    "shared-options-drawer",
    "shared-drawer-backdrop",
    "shared-hidden-drawer-trigger",
    "publish-dropdown",
    "dropdown-popover",
    "widget-controls",
    "widget-download-popover",
    "drawer-backdrop",
    "profile-slide-drawer",
    "shared-unfocus-btn",
    "shared-card-expand-btn",
    "no-export",
  ];
  return !excludedClasses.some((cls) => node.classList.contains(cls));
};

function getResolvedBgColor(node) {
  if (typeof window === "undefined") return "#0a0f1d";
  const docStyle = window.getComputedStyle(document.documentElement);
  const themeBg = docStyle.getPropertyValue("--bg")?.trim();
  if (themeBg) return themeBg;
  const nodeBg = node ? window.getComputedStyle(node).backgroundColor : null;
  if (nodeBg && nodeBg !== "rgba(0, 0, 0, 0)" && nodeBg !== "transparent") return nodeBg;
  return "#0a0f1d";
}

export async function exportCanvasAsPng(node, filename = "dashboard.png") {
  if (!node) return;
  try {
    const bg = getResolvedBgColor(node);
    const dataUrl = await toPng(node, {
      backgroundColor: bg,
      pixelRatio: 2,
      cacheBust: true,
      quality: 0.98,
      filter: filterExportNodes,
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("PNG export error:", err);
  }
}

export async function exportWidgetAsPng(elementId, filename = "chart.png") {
  const node = document.getElementById(elementId);
  if (!node) return;
  try {
    const bg = getResolvedBgColor(node);
    const dataUrl = await toPng(node, {
      backgroundColor: bg,
      pixelRatio: 2,
      cacheBust: true,
      quality: 0.98,
      filter: filterExportNodes,
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Widget PNG export error:", err);
  }
}

export async function exportCanvasAsPdf(node, filename = "dashboard.pdf") {
  if (!node) return;
  try {
    const bg = getResolvedBgColor(node);
    const dataUrl = await toPng(node, {
      backgroundColor: bg,
      pixelRatio: 2,
      cacheBust: true,
      filter: filterExportNodes,
    });
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => (img.onload = resolve));
    const orientation = img.width >= img.height ? "landscape" : "portrait";
    const pdf = new jsPDF({ orientation, unit: "px", format: [img.width, img.height] });
    pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
    pdf.save(filename);
  } catch (err) {
    console.error("PDF export error:", err);
  }
}

export function exportWidgetDataAsCsv(widget, filename) {
  const { type, data } = widget;
  let rows = [];
  if (type === "table" || type === "auction") rows = data.rows || [];
  else if (type === "scoreboard") rows = data.metrics || [];
  else rows = data.data || [];
  if (!rows.length) return;

  const columns = Object.keys(rows[0]);
  const lines = [columns.join(",")];
  rows.forEach((r) => {
    lines.push(columns.map((c) => String(r[c] ?? "").replace(/,/g, "")).join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  saveAs(blob, filename || ((data.title || "chart") + ".csv"));
}