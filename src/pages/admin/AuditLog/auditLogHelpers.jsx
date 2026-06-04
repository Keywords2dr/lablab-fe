import {
  ENTITY_DISPLAY_CONFIG,
  VALUE_LABELS,
  FIELD_BLACKLIST,
} from "./auditLogConstants";

// ── Helper: parse JSON an toàn ─────────────────────────────────────────────
export function parseSafe(jsonString) {
  if (!jsonString) return null;
  try {
    return typeof jsonString === "object" ? jsonString : JSON.parse(jsonString);
  } catch {
    return jsonString;
  }
}

// ── Helper: format giá trị một field ──────────────────────────────────────
export function formatValue(key, val) {
  if (val === null || val === undefined || val === "" || val === "null")
    return null;

  // Dịch enum sang tiếng Việt
  if (VALUE_LABELS[key]?.[val]) return VALUE_LABELS[key][val];

  // Format ngày giờ
  const isDateKey  = /date|at$/i.test(key);
  const isIsoDate  = typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val);
  if (isDateKey || isIsoDate) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString("vi-VN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    }
  }

  return String(val);
}

// ── Render key-value data đệ quy ──────────────────────────────────────────
export function renderKV(data, entityName = "") {
  if (data === null || data === undefined) return null;

  // Primitive
  if (typeof data !== "object") {
    const val = formatValue("", data);
    return val ? <span className="al-kv-val">{val}</span> : null;
  }

  // Array
  if (Array.isArray(data)) {
    const validItems = data.map((item) => renderKV(item, entityName)).filter(Boolean);
    if (validItems.length === 0) return null;
    return (
      <div className="al-kv-arr">
        {data.map((item, i) => {
          const content = renderKV(item, entityName);
          if (!content) return null;
          return (
            <div key={i} className="al-kv-nested">
              <div className="al-kv-idx">Mục {i + 1}</div>
              {content}
            </div>
          );
        })}
      </div>
    );
  }

  // Object
  const config = ENTITY_DISPLAY_CONFIG[entityName] || ENTITY_DISPLAY_CONFIG.DEFAULT;

  const entries = Object.entries(data).filter(([key, val]) => {
    if (FIELD_BLACKLIST.has(key.toLowerCase())) return false;
    const formatted = formatValue(key, val);
    return formatted !== null && formatted !== "—" && formatted !== "";
  });

  if (entries.length === 0) return null;

  return (
    <div className="al-kv-table">
      {entries.map(([key, val]) => {
        const displayKey = config.translations[key] || key;
        const displayValue =
          typeof val === "object" && val !== null
            ? renderKV(val, entityName)
            : formatValue(key, val);

        if (!displayValue) return null;

        return (
          <div key={key} className="al-kv-row">
            <span className="al-kv-key">{displayKey}</span>
            <div className="al-kv-val">{displayValue}</div>
          </div>
        );
      })}
    </div>
  );
}
