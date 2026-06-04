export const CATEGORY_COLORS = {
  Axit: { bg: "#fee2e2", color: "#b91c1c" },
  Bazơ: { bg: "#dbeafe", color: "#1d4ed8" },
  Muối: { bg: "#d1fae5", color: "#065f46" },
  "Hữu cơ": { bg: "#fef3c7", color: "#92400e" },
  "Dung môi": { bg: "#ede9fe", color: "#6d28d9" },
  "Kim loại": { bg: "#e0f2fe", color: "#0369a1" },
};

export function getCategoryStyle(cat = "") {
  const key = Object.keys(CATEGORY_COLORS).find((k) => cat.includes(k));
  return CATEGORY_COLORS[key] || { bg: "#f1f5f9", color: "#475569" };
}

export const SUPPLIER_FLAGS = {
  Japan: "🇯🇵",
  China: "🇨🇳",
  Germany: "🇩🇪",
  India: "🇮🇳",
  Idia: "🇮🇳",
  Switzerland: "🇨🇭",
  USA: "🇺🇸",
  UK: "🇬🇧",
  France: "🇫🇷",
  Korea: "🇰🇷",
  Netherlands: "🇳🇱",
  Singapore: "🇸🇬",
  Australia: "🇦🇺",
};

export function getSupplierFlag(name) {
  if (!name) return "🏢";
  const direct = SUPPLIER_FLAGS[name];
  if (direct) return direct;
  const flags = name
    .split(/[/,&]/)
    .map((s) => SUPPLIER_FLAGS[s.trim()])
    .filter(Boolean);
  return flags.length ? flags.join("") : "🏢";
}
