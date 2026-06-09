import React from "react";

export default function CountBadge({ count }) {
  if (!count) return null;
  return <span className="stp-badge">{count}</span>;
}
