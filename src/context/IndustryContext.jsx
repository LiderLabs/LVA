import React, { createContext, useContext, useEffect, useState } from "react";

const IndustryContext = createContext(null);

// Unlike theme (light/dark), industry isn't a user preference toggle --
// it's determined by which dashboard page is currently mounted. Each
// dashboard page calls setIndustry on mount to announce which skin it
// needs; CSS then reads the resulting data-industry attribute the same
// way it already reads data-theme.
export function IndustryProvider({ children }) {
  const [industry, setIndustry] = useState("general");

  useEffect(() => {
    document.documentElement.setAttribute("data-industry", industry);
  }, [industry]);

  return (
    <IndustryContext.Provider value={{ industry, setIndustry }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const ctx = useContext(IndustryContext);
  if (!ctx) throw new Error("useIndustry must be used inside an IndustryProvider");
  return ctx;
}
