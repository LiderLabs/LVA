import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="btn-icon" onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
    </button>
  );
}
