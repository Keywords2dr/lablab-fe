import React, { useState, useEffect, useRef } from "react";
import {
  ScienceOutlined,
  SearchOutlined,
  MeetingRoomOutlined,
  CheckCircleOutlined,
  AddOutlined,
  RemoveOutlined,
  DeleteOutlined,
  InboxOutlined,
  WarningAmberOutlined,
  ShoppingCartOutlined,
  LocationOnOutlined,
  SupervisorAccountOutlined,
  KeyboardArrowRightOutlined,
  BlockOutlined,
  PlaylistRemoveOutlined,
  ErrorOutlineOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from "@mui/icons-material";
import { roomApi } from "../../../api/roomApi";

const HAZARD_CONFIG = {
  LOW: { label: "Thấp", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  MEDIUM: {
    label: "Trung bình",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  HIGH: { label: "Cao", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

function mapInventoryToChemical(inv) {
  const item = inv.item ?? inv.chemical ?? inv;

  const total = parseFloat(
    inv.totalQuantity ?? inv.total ?? item.totalQuantity ?? 0,
  );
  const locked = parseFloat(
    inv.lockedQuantity ?? inv.locked ?? item.lockedQuantity ?? 0,
  );
  const available = Math.max(0, total - locked);

  return {
    id: inv.itemId ?? item.itemId ?? item.id ?? null,
    chemicalId: item.chemicalId ?? item.id ?? inv.itemId ?? null,
    itemCode: inv.itemCode ?? item.itemCode ?? item.code ?? null,
    name: inv.itemName ?? item.name ?? item.chemicalName ?? null,
    unit: inv.unit ?? item.unit ?? item.unitName ?? "",
    formula: inv.chemicalFormula ?? item.chemicalFormula ?? item.formula ?? "",
    hazardLevel: (
      item.hazardLevel ??
      item.hazard ??
      item.hazardLevelName ??
      "LOW"
    ).toUpperCase(),
    available,
  };
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function RoomSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "4px 0",
      }}
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: 10,
            border: "1px solid #f1f5f9",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            animation: "pulse 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {/* icon placeholder */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#f1f5f9",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                height: 13,
                width: "60%",
                borderRadius: 4,
                background: "#f1f5f9",
              }}
            />
            <div
              style={{
                height: 11,
                width: "40%",
                borderRadius: 4,
                background: "#f8fafc",
              }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StepRoomAndChemicals({
  rooms,
  loading,
  roomSearch,
  setRoomSearch,
  selectedRoom,
  setSelectedRoom,
  selectedChemicals,
  setSelectedChemicals,
  page = 0,
  setPage = () => {},
  totalPages = 0,
}) {
  const [chemSearch, setChemSearch] = useState("");
  const [chemState, setChemState] = useState({
    chemicals: [],
    loadingChem: false,
    chemError: null,
  });
  const { chemicals, loadingChem, chemError } = chemState;
  const abortChemRef = useRef(null);

  useEffect(() => {
    if (abortChemRef.current) abortChemRef.current.abort();
    const ctrl = new AbortController();
    abortChemRef.current = ctrl;

    if (!selectedRoom) {
      return () => ctrl.abort();
    }

    const fetchChemicals = async () => {
      setChemState({ chemicals: [], loadingChem: true, chemError: null });

      try {
        const res = await roomApi.getRoomInventory(selectedRoom.id);
        if (ctrl.signal.aborted) return;

        const raw = Array.isArray(res.data)
          ? res.data
          : (res.data?.content ?? res.data?.items ?? []);

        const mapped = raw
          .map(mapInventoryToChemical)
          .filter((c) => c.id != null && c.name != null && c.available > 0);

        setChemState({
          chemicals: mapped,
          loadingChem: false,
          chemError: null,
        });
      } catch (err) {
        if (ctrl.signal.aborted) return;
        if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
          setChemState({
            chemicals: [],
            loadingChem: false,
            chemError: "Không thể tải danh sách hóa chất. Vui lòng thử lại.",
          });
        }
      }
    };

    fetchChemicals();
    return () => ctrl.abort();
  }, [selectedRoom]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSelectRoom = (room) => {
    if (!room.isActive) return;
    if (selectedRoom?.id === room.id) return;
    setSelectedRoom(room);
    setSelectedChemicals({});
    setChemSearch("");
    setChemState((s) => ({ ...s, chemError: null }));
  };

  const filteredChems = chemicals.filter((c) => {
    const name = (c.name ?? "").toLowerCase();
    const code = (c.itemCode ?? "").toLowerCase();
    return (
      name.includes(chemSearch.toLowerCase()) ||
      code.includes(chemSearch.toLowerCase())
    );
  });

  const totalSelected = Object.keys(selectedChemicals).length;

  const handleToggle = (chem) => {
    setSelectedChemicals((prev) => {
      if (prev[chem.id]) {
        const next = { ...prev };
        delete next[chem.id];
        return next;
      }
      return { ...prev, [chem.id]: { chemical: chem, quantity: 1 } };
    });
  };

  const handleQtyChange = (chemId, delta) => {
    setSelectedChemicals((prev) => {
      if (!prev[chemId]) return prev;
      const max = prev[chemId].chemical.available;
      let next =
        Math.round(
          (parseFloat(prev[chemId].quantity) || 0) * 1000 + delta * 1000,
        ) / 1000;
      next = Math.min(Math.max(0.1, next), max);
      return { ...prev, [chemId]: { ...prev[chemId], quantity: next } };
    });
  };

  const handleQtyInput = (chemId, value) => {
    setSelectedChemicals((prev) => {
      if (!prev[chemId]) return prev;
      const max = prev[chemId].chemical.available;
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed > max) {
        return { ...prev, [chemId]: { ...prev[chemId], quantity: max } };
      }
      return { ...prev, [chemId]: { ...prev[chemId], quantity: value } };
    });
  };

  const handleQtyBlur = (chemId) => {
    setSelectedChemicals((prev) => {
      if (!prev[chemId]) return prev;
      let parsed = parseFloat(prev[chemId].quantity);
      if (isNaN(parsed) || parsed <= 0) parsed = 0.1;
      return { ...prev, [chemId]: { ...prev[chemId], quantity: parsed } };
    });
  };

  const handleRemove = (chemId) => {
    setSelectedChemicals((prev) => {
      const next = { ...prev };
      delete next[chemId];
      return next;
    });
  };

  const handleClearAll = () => setSelectedChemicals({});

  const handleRetry = () => {
    const room = selectedRoom;
    setSelectedRoom(null);
    setTimeout(() => setSelectedRoom(room), 0);
  };

  return (
    <div className="rac-wrapper">
      <div className="rac-split">
        {/* ── Cột trái: danh sách phòng ── */}
        <div className="rac-left">
          <div className="rac-panel-header">
            <MeetingRoomOutlined style={{ fontSize: 17 }} />
            <span>Chọn phòng Lab</span>
            {!loading && rooms.length > 0 && (
              <span className="rac-badge-count">{rooms.length}</span>
            )}
          </div>

          <div className="rac-search-box">
            <SearchOutlined className="rac-search-icon" />
            <input
              className="rac-search-input"
              placeholder="Tìm phòng…"
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
            />
            {roomSearch && (
              <button
                className="rac-search-clear"
                onClick={() => setRoomSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          {loading ? (
            <RoomSkeleton />
          ) : rooms.length === 0 ? (
            <div className="rac-empty-state">
              <InboxOutlined style={{ fontSize: 36 }} />
              <p>Không tìm thấy phòng nào</p>
            </div>
          ) : (
            <div className="rac-room-list">
              {rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const isInactive = !room.isActive;
                // managerName === null means "not yet loaded", "" means "no staff"
                const managerLoading = isSelected && room.managerName === null;
                return (
                  <div
                    key={room.id}
                    className={[
                      "rac-room-card",
                      isSelected ? "rac-room-card--sel" : "",
                      isInactive ? "rac-room-card--inactive" : "",
                    ].join(" ")}
                    onClick={() => handleSelectRoom(room)}
                  >
                    <div className="rac-room-card-left">
                      <div className="rac-room-icon">
                        {isInactive ? (
                          <BlockOutlined style={{ fontSize: 16 }} />
                        ) : (
                          <MeetingRoomOutlined style={{ fontSize: 16 }} />
                        )}
                      </div>
                      <div className="rac-room-info">
                        <div className="rac-room-name">
                          {room.name ?? room.roomName}
                        </div>
                        {room.location && (
                          <div className="rac-room-location">
                            <LocationOnOutlined style={{ fontSize: 12 }} />
                            {room.location}
                          </div>
                        )}
                        {/* Manager: show shimmer while loading, name when ready */}
                        {managerLoading ? (
                          <div
                            style={{
                              height: 10,
                              width: 100,
                              borderRadius: 4,
                              background: "#e2e8f0",
                              marginTop: 4,
                              animation: "pulse 1.4s ease-in-out infinite",
                            }}
                          />
                        ) : room.managerName ? (
                          <div className="rac-room-manager">
                            <SupervisorAccountOutlined
                              style={{ fontSize: 12 }}
                            />
                            {room.managerName}
                          </div>
                        ) : null}
                        {isInactive && (
                          <span className="rac-room-inactive-badge">
                            Không hoạt động
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="rac-room-card-right">
                      {isSelected ? (
                        <CheckCircleOutlined
                          style={{ fontSize: 18, color: "#0284c7" }}
                        />
                      ) : (
                        !isInactive && (
                          <KeyboardArrowRightOutlined
                            style={{ fontSize: 18, color: "#94a3b8" }}
                          />
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 0 4px",
                marginTop: 6,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: page === 0 ? "#f8fafc" : "#fff",
                  color: page === 0 ? "#cbd5e1" : "#475569",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                <ChevronLeftOutlined style={{ fontSize: 16 }} />
              </button>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  minWidth: 48,
                  textAlign: "center",
                }}
              >
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: page >= totalPages - 1 ? "#f8fafc" : "#fff",
                  color: page >= totalPages - 1 ? "#cbd5e1" : "#475569",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                <ChevronRightOutlined style={{ fontSize: 16 }} />
              </button>
            </div>
          )}
        </div>

        <div className="rac-divider" />

        {/* ── Cột phải: hóa chất + giỏ ── */}
        <div className="rac-right">
          {!selectedRoom ? (
            <div className="rac-placeholder">
              <div className="rac-placeholder-icon">
                <ScienceOutlined style={{ fontSize: 40 }} />
              </div>
              <p>Chọn một phòng bên trái để xem danh sách hóa chất khả dụng</p>
            </div>
          ) : (
            <>
              <div className="rac-panel-header">
                <ScienceOutlined style={{ fontSize: 17 }} />
                <span>
                  Hóa chất —{" "}
                  <strong>{selectedRoom.name ?? selectedRoom.roomName}</strong>
                </span>
                {totalSelected > 0 && (
                  <span className="rac-badge-selected">
                    {totalSelected} đã chọn
                  </span>
                )}
              </div>

              <div className="rac-chem-layout">
                {/* Danh sách hóa chất */}
                <div className="rac-chem-col">
                  <div className="rac-search-box" style={{ marginBottom: 10 }}>
                    <SearchOutlined className="rac-search-icon" />
                    <input
                      className="rac-search-input"
                      placeholder="Tìm theo tên hoặc mã hóa chất…"
                      value={chemSearch}
                      onChange={(e) => setChemSearch(e.target.value)}
                    />
                    {chemSearch && (
                      <button
                        className="rac-search-clear"
                        onClick={() => setChemSearch("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {loadingChem ? (
                    <div className="rac-loading">Đang tải hóa chất...</div>
                  ) : chemError ? (
                    <div className="rac-error-state">
                      <ErrorOutlineOutlined style={{ fontSize: 32 }} />
                      <p>{chemError}</p>
                      <button className="rac-retry-btn" onClick={handleRetry}>
                        Thử lại
                      </button>
                    </div>
                  ) : chemicals.length === 0 ? (
                    <div className="rac-empty-state">
                      <InboxOutlined style={{ fontSize: 36 }} />
                      <p>Phòng này chưa có hóa chất khả dụng</p>
                    </div>
                  ) : filteredChems.length === 0 ? (
                    <div className="rac-empty-state">
                      <InboxOutlined style={{ fontSize: 36 }} />
                      <p>Không tìm thấy hóa chất</p>
                    </div>
                  ) : (
                    <div className="rac-chem-list">
                      {filteredChems.map((chem) => {
                        const isSel = !!selectedChemicals[chem.id];
                        const hazard =
                          HAZARD_CONFIG[chem.hazardLevel] ?? HAZARD_CONFIG.LOW;
                        const isLowStock = chem.available < 50;
                        return (
                          <div
                            key={chem.id}
                            className={`rac-chem-card${isSel ? " rac-chem-card--sel" : ""}`}
                            onClick={() => handleToggle(chem)}
                          >
                            <div
                              className={`rac-chem-check${isSel ? " rac-chem-check--on" : ""}`}
                            >
                              {isSel && (
                                <CheckCircleOutlined style={{ fontSize: 13 }} />
                              )}
                            </div>
                            <div className="rac-chem-icon">
                              <ScienceOutlined style={{ fontSize: 15 }} />
                            </div>
                            <div className="rac-chem-info">
                              <div className="rac-chem-name">{chem.name}</div>
                              <div className="rac-chem-meta-row">
                                {chem.itemCode && (
                                  <span className="rac-cas">
                                    Mã HC: {chem.itemCode}
                                  </span>
                                )}
                                {chem.formula && (
                                  <span
                                    className="rac-cas"
                                    style={{ marginLeft: 8 }}
                                  >
                                    CTHH: <strong>{chem.formula}</strong>
                                  </span>
                                )}
                              </div>
                              <div className="rac-chem-avail">
                                Khả dụng:{" "}
                                <strong
                                  style={{
                                    color: isLowStock ? "#ef4444" : "#0f172a",
                                  }}
                                >
                                  {chem.available} {chem.unit}
                                </strong>
                                {isLowStock && (
                                  <span className="rac-low-stock">
                                    {" "}
                                    ⚠ Sắp hết
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Giỏ hóa chất đã chọn */}
                <div className="rac-cart-col">
                  <div className="rac-cart-header">
                    <ShoppingCartOutlined style={{ fontSize: 15 }} />
                    <span>Đã chọn</span>
                    {totalSelected > 0 && (
                      <span className="rac-cart-count">{totalSelected}</span>
                    )}
                    {totalSelected > 0 && (
                      <button
                        className="rac-cart-clear-all"
                        onClick={handleClearAll}
                        title="Xóa tất cả"
                      >
                        <PlaylistRemoveOutlined style={{ fontSize: 15 }} />
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  {totalSelected === 0 ? (
                    <div className="rac-cart-empty">
                      <ScienceOutlined
                        style={{ fontSize: 28, color: "#cbd5e1" }}
                      />
                      <p>Chưa chọn hóa chất nào</p>
                      <span>Bấm vào hóa chất để thêm</span>
                    </div>
                  ) : (
                    <div className="rac-cart-list">
                      {Object.values(selectedChemicals).map(
                        ({ chemical, quantity }) => (
                          <div key={chemical.id} className="rac-cart-item">
                            <div className="rac-cart-item-top">
                              <div className="rac-cart-item-name">
                                {chemical.name}
                              </div>
                              <button
                                className="rac-cart-remove"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemove(chemical.id);
                                }}
                                title="Xóa"
                              >
                                <DeleteOutlined style={{ fontSize: 14 }} />
                              </button>
                            </div>
                            <div className="rac-cart-item-bottom">
                              <div className="rac-qty-ctrl">
                                <button
                                  className="rac-qty-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQtyChange(chemical.id, -1);
                                  }}
                                  disabled={parseFloat(quantity) <= 0.1}
                                >
                                  <RemoveOutlined style={{ fontSize: 13 }} />
                                </button>
                                <input
                                  className="rac-qty-input"
                                  type="number"
                                  step="any"
                                  min="0.1"
                                  max={chemical.available}
                                  value={quantity}
                                  onChange={(e) =>
                                    handleQtyInput(chemical.id, e.target.value)
                                  }
                                  onBlur={() => handleQtyBlur(chemical.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  className="rac-qty-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQtyChange(chemical.id, 1);
                                  }}
                                  disabled={
                                    parseFloat(quantity) >= chemical.available
                                  }
                                >
                                  <AddOutlined style={{ fontSize: 13 }} />
                                </button>
                              </div>
                              <span className="rac-unit">{chemical.unit}</span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
