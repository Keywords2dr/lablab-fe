import React, { useEffect, useState, useCallback } from "react";
import {
  Close,
  Science,
  Inventory2,
  Search,
  Refresh,
} from "@mui/icons-material";
import { roomApi } from "../../../../api/roomApi";

export default function RoomInventoryModal({ room, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchInventory = useCallback(async () => {
    if (!room) return;
    setLoading(true);
    try {
      const res = await roomApi.getRoomInventory(room.roomId);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [room]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  if (!room) return null;

  const filtered = search.trim()
    ? items.filter(
        (it) =>
          it.itemName?.toLowerCase().includes(search.toLowerCase()) ||
          it.itemCode?.toLowerCase().includes(search.toLowerCase()) ||
          it.chemicalFormula?.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const totalChemicals = items.filter(
    (it) => it.categoryType === "CHEMICAL",
  ).length;

  return (
    <div className="rm-overlay">
      {/* ĐÃ XÓA SỰ KIỆN onClick Ở TRÊN ĐỂ CHẶN ĐÓNG KHI CLICK RA NGOÀI */}
      <div
        className="rm-modal"
        style={{
          maxWidth: "92vw",
          width: "1100px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="rm-modal-header"
          style={{ flexShrink: 0, padding: "28px 32px 16px" }}
        >
          <div
            className="rm-modal-icon"
            style={{
              background: "rgba(14,165,233,0.12)",
              color: "#0ea5e9",
              width: 52,
              height: 52,
            }}
          >
            <Science style={{ fontSize: 26 }} />
          </div>
          <div>
            <div className="rm-modal-title" style={{ fontSize: "1.25rem" }}>
              Kho vật tư — {room.roomName}
            </div>
            <div className="rm-modal-sub" style={{ fontSize: "0.85rem" }}>
              {loading
                ? "Đang tải..."
                : `${totalChemicals} hóa chất · ${items.length} loại vật tư`}
            </div>
          </div>
          <button className="rm-modal-close" onClick={onClose}>
            <Close />
          </button>
        </div>

        {/* Search + Refresh */}
        <div
          style={{
            padding: "0 32px 16px",
            flexShrink: 0,
            display: "flex",
            gap: 10,
          }}
        >
          <div className="rm-search-wrap" style={{ flex: 1 }}>
            <Search className="rm-search-icon" />
            <input
              placeholder="Tìm tên, mã, công thức..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="rm-search-clear" onClick={() => setSearch("")}>
                <Close />
              </button>
            )}
          </div>
          <button
            className="rm-btn-icon"
            onClick={fetchInventory}
            disabled={loading}
            title="Làm mới"
          >
            <Refresh
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 32px 32px" }}>
          {loading ? (
            <div className="rm-empty">
              <Inventory2 />
              <p>Đang tải dữ liệu kho...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rm-empty">
              <Inventory2 />
              <p>
                {search
                  ? "Không tìm thấy vật tư phù hợp"
                  : "Phòng này chưa có vật tư nào"}
              </p>
            </div>
          ) : (
            <table className="rm-table" style={{ fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th style={{ width: 52 }}>STT</th>
                  <th style={{ width: 130 }}>Mã</th>
                  <th>Tên vật tư</th>
                  <th style={{ width: 120 }}>Công thức</th>
                  <th className="center" style={{ width: 110 }}>
                    Tổng SL
                  </th>
                  <th className="center" style={{ width: 110 }}>
                    Đang khóa
                  </th>
                  <th className="center" style={{ width: 110 }}>
                    Khả dụng
                  </th>
                  <th style={{ width: 80 }}>Đơn vị</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it, idx) => {
                  const available = parseFloat(it.availableQuantity ?? 0);
                  const total = parseFloat(it.totalQuantity ?? 0);
                  const locked = parseFloat(it.lockedQuantity ?? 0);
                  const isLow = total > 0 && available / total < 0.2;
                  const isEmpty = available <= 0;

                  return (
                    <tr key={it.itemId ?? idx}>
                      <td
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: 5,
                            color: "#475569",
                          }}
                        >
                          {it.itemCode || "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="rm-name"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {it.itemName || "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          color: "#64748b",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        {it.chemicalFormula || "—"}
                      </td>
                      <td
                        className="center"
                        style={{ fontWeight: 600, fontSize: "0.95rem" }}
                      >
                        {total.toLocaleString("vi-VN")}
                      </td>
                      <td
                        className="center"
                        style={{
                          color: locked > 0 ? "#f59e0b" : "#94a3b8",
                          fontSize: "0.95rem",
                        }}
                      >
                        {locked > 0 ? locked.toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="center">
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: "1rem",
                            color: isEmpty
                              ? "#ef4444"
                              : isLow
                                ? "#f59e0b"
                                : "#16a34a",
                          }}
                        >
                          {available.toLocaleString("vi-VN")}
                        </span>
                      </td>
                      <td
                        style={{
                          color: "#64748b",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                        }}
                      >
                        {it.unit || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
