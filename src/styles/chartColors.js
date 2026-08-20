import { useTheme } from "../context/ThemeContext";

const darkColors = {
  amber: "#ff9f0a",
  border: "#1e293b",
  surface: "#10172a",
  surfaceRaised: "#1e293b",
  textMuted: "#64748b",
  textSecondary: "#94a3b8",
  textPrimary: "#f8fafc",
  good: "#3ddc84",
  bad: "#ff3b30",
  info: "#38bdf8",
  series: ["#ff9f0a", "#38bdf8", "#3ddc84", "#a855f7", "#f43f5e", "#ffd60a", "#94a3b8"],
};

const lightColors = {
  amber: "#d97706",
  border: "#e2e8f0",
  surface: "#ffffff",
  surfaceRaised: "#f1f5f9",
  textMuted: "#64748b",
  textSecondary: "#475569",
  textPrimary: "#0f172a",
  good: "#16a34a",
  bad: "#dc2626",
  info: "#0284c7",
  series: ["#d97706", "#0284c7", "#16a34a", "#9333ea", "#e11d48", "#ca8a04", "#64748b"],
};

export function useChartColors() {
  try {
    const { theme } = useTheme();
    return theme === "light" ? lightColors : darkColors;
  } catch {
    return darkColors;
  }
}
