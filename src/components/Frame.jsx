import React, { forwardRef } from "react";
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
