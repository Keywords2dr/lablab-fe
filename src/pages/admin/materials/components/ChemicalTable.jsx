import React, { useRef } from "react";
import {
  Edit,
  Delete,
  Search,
  Science,
  Close,
  ChevronLeft,
  ChevronRight,
  Refresh,
  Add,
  DeleteSweep,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import "./ChemicalTable.css";

const SORT_OPTIONS = [
  { value: "itemCode,asc", label: "Mã: A → Z" },
  { value: "itemCode,desc", label: "Mã: Z → A" },
  { value: "name,asc", label: "Tên: A → Z" },
  { value: "name,desc", label: "Tên: Z → A" },
];

export default function ChemicalTable({
  chemicals,
  inventory,
  loading,
  filters,
  onFilterChange,
  onResetFilters,
  formOptions,
  serverPage,
  totalPages,
  totalElements,
  onPageChange,
  onEdit,
  onDelete,
  onAdd,
  onOpenTrash,
}) {
  const { packagings = [], suppliers = [], units = [] } = formOptions || {};

  const kwTimer = useRef(null);
  const isComposing = useRef(false);

  const handleSearchKeyDown = (e) => {
    const navKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];
    if (navKeys.includes(e.key)) return;
    if (
      e.ctrlKey &&
      ["a", "c", "v", "x", "y", "z"].includes(e.key.toLowerCase())
    )
      return;
    if (e.key === "Process" || e.key === "Unidentified" || e.key === "Dead")
      return;
    if (/^[a-zA-ZÀ-ỹ0-9\s_\-()/.,]$/.test(e.key)) return;
    e.preventDefault();
  };

  const handleSearchPaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    if (/[!@#$%^&*+=[\]{};:'"\\|<>?`~]/.test(pasted)) {
      e.preventDefault();
      toast.warning("Từ khóa tìm kiếm không được chứa ký tự đặc biệt!");
    }
  };

  const commitSearch = (val) => {
    clearTimeout(kwTimer.current);
    kwTimer.current = setTimeout(() => {
      onFilterChange({ keyword: val.trim() });
    }, 450);
  };

  const hasActiveFilters = !!(
    filters.keyword ||
    filters.packaging ||
    filters.supplier ||
    filters.unit
  );

  const pageNums = () => {
    const nums = [];
    const start = Math.max(0, serverPage - 2);
    const end = Math.min(totalPages - 1, serverPage + 2);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="mm-toolbar">
        <div className="mm-search-wrap">
          <Search className="mm-search-icon" />
          <input
            placeholder="Tìm mã, tên, công thức..."
            value={filters.keyword}
            onKeyDown={handleSearchKeyDown}
            onPaste={handleSearchPaste}
            onCompositionStart={() => {
              isComposing.current = true;
            }}
            onCompositionEnd={(e) => {
              isComposing.current = false;
              onFilterChange({ keyword: e.target.value });
              commitSearch(e.target.value);
            }}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({ keyword: val });
              if (!isComposing.current) commitSearch(val);
            }}
          />
          {filters.keyword && (
            <button
              className="mm-search-clear"
              onClick={() => onFilterChange({ keyword: "" })}
            >
              <Close />
            </button>
          )}
        </div>

        {/* Đóng gói */}
        <div className="mm-filter-pill">
          <span className="mm-filter-pill-label">📦 Đóng gói</span>
          <select
            value={filters.packaging}
            onChange={(e) => onFilterChange({ packaging: e.target.value })}
          >
            <option value="">Tất cả</option>
            {packagings.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Nhà cung cấp */}
        <div className="mm-filter-pill">
          <span className="mm-filter-pill-label">🏭 Nhà CC</span>
          <select
            value={filters.supplier}
            onChange={(e) => onFilterChange({ supplier: e.target.value })}
          >
            <option value="">Tất cả</option>
            {suppliers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Đơn vị */}
        <div className="mm-filter-pill">
          <span className="mm-filter-pill-label">⚗️ Đơn vị</span>
          <select
            value={filters.unit}
            onChange={(e) => onFilterChange({ unit: e.target.value })}
          >
            <option value="">Tất cả</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Sắp xếp */}
        <div className="mm-filter-pill">
          <span className="mm-filter-pill-label">↕ Sắp xếp</span>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            className="mm-btn-reset"
            onClick={onResetFilters}
            title="Xóa bộ lọc"
          >
            <Close /> Reset
          </button>
        )}

        <button
          className="mm-btn-icon mm-btn-trash"
          onClick={onOpenTrash}
          title="Thùng rác"
        >
          <DeleteSweep />
        </button>

        <button
          className="mm-btn-icon"
          onClick={() => onPageChange(serverPage)}
          disabled={loading}
          title="Làm mới"
        >
          <Refresh
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
          />
        </button>

        <button className="mm-btn-add" onClick={onAdd}>
          <Add /> Thêm mới
        </button>
      </div>

      {hasActiveFilters && (
        <div className="mm-filter-chips">
          {filters.keyword && (
            <span className="mm-chip-filter">
              🔍 &ldquo;{filters.keyword}&rdquo;
              <button onClick={() => onFilterChange({ keyword: "" })}>
                <Close />
              </button>
            </span>
          )}
          {filters.packaging && (
            <span className="mm-chip-filter">
              📦 {filters.packaging}
              <button onClick={() => onFilterChange({ packaging: "" })}>
                <Close />
              </button>
            </span>
          )}
          {filters.supplier && (
            <span className="mm-chip-filter">
              🏭 {filters.supplier}
              <button onClick={() => onFilterChange({ supplier: "" })}>
                <Close />
              </button>
            </span>
          )}
          {filters.unit && (
            <span className="mm-chip-filter">
              ⚗️ {filters.unit}
              <button onClick={() => onFilterChange({ unit: "" })}>
                <Close />
              </button>
            </span>
          )}
          <button className="mm-chips-clear-all" onClick={onResetFilters}>
            Xóa tất cả
          </button>
        </div>
      )}

      {/* ── Bảng dữ liệu ── */}
      <div className="mm-table-card">
        <div className="mm-table-info">
          Trang {serverPage + 1}/{totalPages} · Hiển thị{" "}
          <strong>{chemicals.length}</strong> / <strong>{totalElements}</strong>{" "}
          hóa chất
          {hasActiveFilters && (
            <span className="mm-filter-active-tag"> · Đang lọc</span>
          )}
        </div>
        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên hóa chất</th>
                <th>Công thức</th>
                <th className="center">Đơn vị</th>
                <th className="center">Đóng gói</th>
                <th className="right">Lượng/gói</th>
                <th className="right">Tổng tồn kho</th>
                <th className="center">Phòng lưu trữ</th>
                <th className="center">Nhà CC</th>
                <th className="center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10}>
                    <div className="mm-empty">
                      <Science />
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : chemicals.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="mm-empty">
                      <Science />
                      <p>Không tìm thấy kết quả phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
                chemicals.map((item) => {
                  const inv = inventory[item.itemId];
                  const grandTotal = inv?.grandTotal ?? "—";
                  const rooms =
                    inv?.roomDetails?.map((r) => r.roomName).join(", ") || "—";
                  return (
                    <tr key={item.itemId}>
                      <td>
                        <span className="mm-code">{item.itemCode}</span>
                      </td>
                      <td>
                        <span className="mm-name">{item.name}</span>
                        {grandTotal === 0 && (
                          <span
                            style={{
                              display: "inline-block",
                              marginLeft: 6,
                              background: "#fef2f2",
                              color: "#dc2626",
                              border: "1px solid #fecaca",
                              borderRadius: 4,
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "1px 5px",
                              verticalAlign: "middle",
                            }}
                          >
                            Hết hàng
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.82rem",
                          color: "#4f46e5",
                        }}
                      >
                        {item.formula || "—"}
                      </td>
                      <td className="center">{item.unit}</td>
                      <td
                        className="center"
                        style={{ fontSize: "0.82rem", color: "#64748b" }}
                      >
                        {item.packaging || "—"}
                      </td>
                      <td className="right" style={{ fontWeight: 600 }}>
                        {item.amountPerPackage ?? "—"}
                      </td>
                      <td
                        className="right"
                        style={{
                          fontWeight: 700,
                          color: grandTotal === 0 ? "#dc2626" : "#1e293b",
                        }}
                      >
                        {grandTotal !== "—"
                          ? `${grandTotal} ${item.unit}`
                          : "—"}
                      </td>
                      <td
                        className="center"
                        style={{
                          fontSize: "0.78rem",
                          color: "#64748b",
                          maxWidth: 120,
                        }}
                      >
                        {rooms}
                      </td>
                      <td
                        className="center"
                        style={{ fontSize: "0.82rem", color: "#64748b" }}
                      >
                        {item.supplier || "—"}
                      </td>
                      <td>
                        <div className="mm-actions">
                          <button
                            className="mm-act-btn edit"
                            title="Chỉnh sửa"
                            onClick={() => onEdit(item)}
                          >
                            <Edit />
                          </button>
                          <button
                            className="mm-act-btn del"
                            title="Xóa"
                            onClick={() => onDelete(item)}
                          >
                            <Delete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Phân trang ── */}
      {totalPages > 1 && (
        <div className="mm-pagination">
          <span className="mm-page-info">
            Trang {serverPage + 1} / {totalPages} ({totalElements} hóa chất)
          </span>
          <div className="mm-page-btns">
            <button
              className="mm-page-btn"
              disabled={serverPage === 0}
              onClick={() => onPageChange(serverPage - 1)}
            >
              <ChevronLeft />
            </button>
            {pageNums().map((n) => (
              <button
                key={n}
                className={`mm-page-btn${serverPage === n ? " active" : ""}`}
                onClick={() => onPageChange(n)}
              >
                {n + 1}
              </button>
            ))}
            <button
              className="mm-page-btn"
              disabled={serverPage === totalPages - 1}
              onClick={() => onPageChange(serverPage + 1)}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
