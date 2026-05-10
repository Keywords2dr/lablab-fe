import React from "react";

const COLORS = [
  "#6366f1", "#0ea5e9", "#10b981",
  "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4",
];

/**
 * @param {string}  name  - Họ tên đầy đủ
 * @param {number}  size  - Kích thước px (default: 36)
 * @param {object}  style - Style override
 */
export default function Avatar({ name, size = 36, style = {} }) {
  const initials = name
    ? name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  const bg = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];

  return (
    <div
      aria-label={name ?? "Unknown"}
      style={{
        width:          size,
        height:         size,
        borderRadius:   "50%",
        background:     bg,
        color:          "#fff",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontWeight:     700,
        fontSize:       size * 0.38,
        flexShrink:     0,
        userSelect:     "none",
        ...style,
      }}
    >
      {initials}
    </div>
  );
}