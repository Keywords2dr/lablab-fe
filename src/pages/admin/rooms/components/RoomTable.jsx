import React, { useRef } from "react";
import {
  Edit,
  Search,
  Close,
  Refresh,
  Add,
  MeetingRoom,
  CheckCircle,
  Block,
  ChevronLeft,
  ChevronRight,
  PowerSettingsNew,
  DoNotDisturb,
  Inventory2,
} from "@mui/icons-material";

const RE_SEARCH = /^[\p{L}\p{N}\s]*$/u;
const filterSearchInput = (val) =>
  [...val].filter((ch) => RE_SEARCH.test(ch)).join("");

export default function RoomTable({
  rooms,
  loading,
  filters,
  pagination,
  onFilterChange,
  onResetFilters,
  onEdit,
  onDeactivate,
  onActivate,
  onAdd,
  onReload,
  onPageChange,
  onViewInventory,
}) {
  const roomsList = Array.isArray(rooms) ? rooms : [];
  const kwTimer = useRef(null);
  const isComposing = useRef(false);

  const commitSearch = (val) => {
    clearTimeout(kwTimer.current);
    kwTimer.current = setTimeout(
      () => onFilterChange({ keyword: val.trim() }),
      400,
    );
  };

  const handleKeywordChange = (e) => {
    const raw = e.target.value;
    const filtered = filterSearchInput(raw);
    onFilterChange({ keyword: filtered });
    if (!isComposing.current) commitSearch(filtered);
  };

  const {
    page = 0,
    totalElements = 0,
    totalPages = 0,
    size = 10,
  } = pagination ?? {};
  const hasFilters = !!(filters.keyword || filters.status);

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="rm-toolbar">
        {/* Search */}
        <div className="rm-search-wrap" style={{ flex: 1, minWidth: 180 }}>
          <Search className="rm-search-icon" />
          <input
            placeholder="Tìm tên phòng, mô tả..."
            value={filters.keyword}
            onCompositionStart={() => {
              isComposing.current = true;
            }}
            onCompositionEnd={(e) => {
              isComposing.current = false;
              const filtered = filterSearchInput(e.target.value);
              commitSearch(filtered);
              onFilterChange({ keyword: filtered });
            }}
            onChange={handleKeywordChange}
          />
          {filters.keyword && (
            <button
              className="rm-search-clear"
              onClick={() => onFilterChange({ keyword: "" })}
            >
              <Close />
            </button>
          )}
        </div>

        {/* Filter trạng thái */}
        <div className="rm-filter-pill">
          <span className="rm-filter-label">Trạng thái</span>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>

        {hasFilters && (
          <button className="rm-btn-reset" onClick={onResetFilters}>
            <Close /> Reset
          </button>
        )}

        <button
          className="rm-btn-icon"
          onClick={onReload}
          disabled={loading}
          title="Làm mới"
        >
          <Refresh
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
          />
        </button>

        <button className="rm-btn-add" onClick={onAdd}>
          <Add /> Thêm phòng
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="rm-table-card">
        <div className="rm-table-info">
          Hiển thị <strong>{roomsList.length}</strong>
          {totalElements > 0 && (
            <>
              {" "}
              / <strong>{totalElements}</strong> phòng
            </>
          )}
          {hasFilters && (
            <span className="rm-filter-active-tag"> · Đang lọc</span>
          )}
        </div>
        <div className="rm-table-wrap">
          <table className="rm-table">
            <thead>
              <tr>
                <th style={{ width: 52 }}>STT</th>
                <th>Tên phòng</th>
                <th>Mô tả</th>
                <th className="center" style={{ width: 150 }}>
                  Trạng thái
                </th>
                <th className="center" style={{ width: 120 }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="rm-empty">
                      <MeetingRoom />
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : roomsList.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="rm-empty">
                      <MeetingRoom />
                      <p>Không tìm thấy phòng phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
                roomsList.map((room, idx) => (
                  <tr
                    key={room.roomId}
                    style={{ opacity: room.isActive ? 1 : 0.65 }}
                  >
                    <td
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                      }}
                    >
                      {page * size + idx + 1}
                    </td>
                    <td>
                      <span className="rm-name">{room.roomName}</span>
                    </td>
                    <td>
                      <span className="rm-desc">{room.description || "—"}</span>
                    </td>
                    <td className="center">
                      {room.isActive ? (
                        <span
                          className="rm-status-badge"
                          style={{
                            color: "#16a34a",
                            background: "#dcfce7",
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          <CheckCircle style={{ fontSize: "0.75rem" }} /> Hoạt
                          động
                        </span>
                      ) : (
                        <span
                          className="rm-status-badge"
                          style={{
                            color: "#dc2626",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                          }}
                        >
                          <Block style={{ fontSize: "0.75rem" }} /> Ngừng HĐ
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="rm-actions">
                        <button
                          className="rm-act-btn"
                          title="Xem kho vật tư"
                          onClick={() => onViewInventory(room)}
                          style={{ color: "#0ea5e9", borderColor: "#0ea5e9" }}
                        >
                          <Inventory2 />
                        </button>
                        <button
                          className="rm-act-btn edit"
                          title="Chỉnh sửa"
                          onClick={() => onEdit(room)}
                        >
                          <Edit />
                        </button>
                        {room.isActive ? (
                          <button
                            className="rm-act-btn del"
                            title="Ngừng hoạt động"
                            onClick={() => onDeactivate(room)}
                          >
                            <DoNotDisturb />
                          </button>
                        ) : (
                          <button
                            className="rm-act-btn activate"
                            title="Kích hoạt lại"
                            onClick={() => onActivate(room)}
                            style={{ color: "#16a34a", borderColor: "#16a34a" }}
                          >
                            <PowerSettingsNew />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="rm-pagination">
            <span className="rm-page-info">
              Trang {page + 1} / {totalPages}
              <span style={{ color: "#94a3b8", marginLeft: 6 }}>
                ({totalElements} phòng)
              </span>
            </span>
            <div className="rm-page-btns">
              <button
                className="rm-page-btn"
                disabled={page === 0}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft style={{ fontSize: 18 }} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(
                  (i) =>
                    i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1,
                )
                .reduce((acc, i, idx, arr) => {
                  if (idx > 0 && i - arr[idx - 1] > 1) acc.push("...");
                  acc.push(i);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`dot-${i}`} className="rm-page-dots">
                      ···
                    </span>
                  ) : (
                    <button
                      key={item}
                      className={`rm-page-btn${item === page ? " active" : ""}`}
                      onClick={() => onPageChange(item)}
                    >
                      {item + 1}
                    </button>
                  ),
                )}

              <button
                className="rm-page-btn"
                disabled={page === totalPages - 1}
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRight style={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
