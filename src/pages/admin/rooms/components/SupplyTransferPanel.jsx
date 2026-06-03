import React, { useState, useMemo, useCallback } from "react";
import {
  Inventory2Outlined,
  SendOutlined,
  UndoOutlined,
  SearchOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  DomainOutlined,
  AddOutlined,
  RemoveOutlined,
  StickyNote2Outlined,
  WarningAmberOutlined,
  DeleteSweepOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
} from "@mui/icons-material";

import { useInventory } from "../hooks/useInventory";
import "../styles/supply.css";

/* ── helpers ─────────────────────────────────────────────────── */
const RE_NOTE_ALLOWED = /[^a-zA-Z0-9À-ỹ\s.,\-_]/g;
const sanitizeNote = (val) => val.replace(RE_NOTE_ALLOWED, "");

const RE_SEARCH = /^[\p{L}\p{N}\s]*$/u;
const filterSearchInput = (val) =>
  [...val].filter((ch) => RE_SEARCH.test(ch)).join("");

function validatePackageCount(val) {
  const n = Number(val);
  if (!val && val !== 0) return "Bắt buộc";
  if (!Number.isInteger(n) || n < 1) return "≥ 1 gói";
  return "";
}

/* ── sub-components ──────────────────────────────────────────── */
function CountBadge({ count }) {
  if (!count) return null;
  return <span className="stp-badge">{count}</span>;
}

function StepDot({ num, status }) {
  return (
    <div className={`stp-dot stp-dot--${status}`}>
      {status === "done" ? (
        <CheckCircleOutlined style={{ fontSize: 14 }} />
      ) : (
        num
      )}
    </div>
  );
}

function ItemCard({ item, selected, packageCount, onToggle, onChangeCount }) {
  const uid = item.itemId || item.itemCode;
  const error = selected ? validatePackageCount(packageCount) : false;

  const handleCardClick = (e) => {
    if (e.target.closest(".stp-inline-qty")) return;
    onToggle(uid);
  };

  return (
    <div
      className={`stp-item-card ${selected ? "stp-item-card--selected" : ""} ${
        selected && error ? "stp-item-card--error" : ""
      }`}
      onClick={handleCardClick}
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick(e)}
    >
      {selected && (
        <div className="stp-item-card__check">
          <CheckCircleOutlined style={{ fontSize: 14 }} />
        </div>
      )}

      <div className="stp-item-card__name">{item.itemName}</div>
      <div className="stp-item-card__code">{item.itemCode}</div>

      <div className="stp-item-card__meta">
        {item.formula && (
          <span className="stp-item-card__cat">{item.formula}</span>
        )}
        {item.packageHint ? (
          <span className="stp-item-card__stock">{item.packageHint}</span>
        ) : (
          <span className="stp-item-card__unit">{item.unit}</span>
        )}
      </div>

      {item.supplier && (
        <div className="stp-item-card__supplier">{item.supplier}</div>
      )}

      {selected && (
        <div className="stp-inline-qty" onClick={(e) => e.stopPropagation()}>
          <button
            className="stp-qty-btn"
            onClick={() =>
              onChangeCount(uid, Math.max(1, (Number(packageCount) || 1) - 1))
            }
            disabled={Number(packageCount) <= 1}
            aria-label="Giảm"
          >
            <RemoveOutlined style={{ fontSize: 12 }} />
          </button>

          <input
            type="text"
            inputMode="numeric"
            className={`stp-qty-input stp-qty-input--inline ${error ? "stp-qty-input--error" : ""}`}
            style={{ minWidth: "30px", flexGrow: 1, textAlign: "center" }}
            value={packageCount !== undefined ? packageCount : ""}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              onChangeCount(uid, val);
            }}
            aria-label={`Số lượng ${item.itemName}`}
          />

          <button
            className="stp-qty-btn"
            onClick={() => onChangeCount(uid, (Number(packageCount) || 0) + 1)}
            aria-label="Tăng"
          >
            <AddOutlined style={{ fontSize: 12 }} />
          </button>
        </div>
      )}

      {selected && error && (
        <div className="stp-item-card__errmsg">{error}</div>
      )}
    </div>
  );
}

function RoomItemSection({
  room,
  items,
  roomItems,
  onToggleItem,
  onChangeCount,
  onRemoveRoom,
}) {
  const [expanded, setExpanded] = useState(true);

  const selectedCount = Object.keys(roomItems).length;
  const allValid = Object.entries(roomItems).every(
    ([, cnt]) => !validatePackageCount(cnt),
  );

  return (
    <div className="stp-room-section">
      {/* ── Room header bar ── */}
      <div
        className={`stp-room-section__header ${!allValid && selectedCount > 0 ? "stp-room-section__header--warn" : ""}`}
      >
        <button
          className="stp-room-section__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <DomainOutlined style={{ fontSize: 16, flexShrink: 0 }} />
          <span className="stp-room-section__name">{room.roomName}</span>
          {selectedCount > 0 && (
            <span className="stp-room-section__count">
              {selectedCount} hóa chất
              {!allValid && (
                <WarningAmberOutlined
                  style={{ fontSize: 13, color: "#d97706", marginLeft: 3 }}
                />
              )}
            </span>
          )}
          {expanded ? (
            <ExpandLessOutlined style={{ fontSize: 18, marginLeft: "auto" }} />
          ) : (
            <ExpandMoreOutlined style={{ fontSize: 18, marginLeft: "auto" }} />
          )}
        </button>

        <button
          className="stp-room-section__remove"
          onClick={() => onRemoveRoom(room.roomId)}
          title="Xoá phòng này"
          aria-label={`Xoá phòng ${room.roomName}`}
        >
          <CloseOutlined style={{ fontSize: 14 }} />
        </button>
      </div>

      {/* ── Item grid ── */}
      {expanded && (
        <div className="stp-room-section__body">
          {items.length === 0 ? (
            <div className="stp-empty stp-empty--sm">
              Không tìm thấy hóa chất
            </div>
          ) : (
            <div className="stp-item-grid stp-item-grid--compact">
              {items.map((item) => {
                const uid = item.itemId || item.itemCode;
                return (
                  <ItemCard
                    key={uid}
                    item={item}
                    selected={roomItems[uid] !== undefined}
                    packageCount={roomItems[uid]}
                    onToggle={onToggleItem}
                    onChangeCount={onChangeCount}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function SupplyTransferPanel({ rooms = [] }) {
  const { globalItems, loading, submitting, allocate, revoke } = useInventory();

  const [mode, setMode] = useState("allocate");
  const [itemSearch, setItemSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");

  const [roomItems, setRoomItems] = useState({});
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  /* ── reset khi đổi mode ── */
  const switchMode = useCallback((m) => {
    setMode(m);
    setRoomItems({});
    setNote("");
    setItemSearch("");
    setRoomSearch("");
  }, []);

  /* ── filter helpers ── */
  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    const arr = q
      ? globalItems.filter(
          (i) =>
            i.itemName?.toLowerCase().includes(q) ||
            i.itemCode?.toLowerCase().includes(q) ||
            i.formula?.toLowerCase().includes(q) ||
            i.supplier?.toLowerCase().includes(q),
        )
      : globalItems;
    const seen = new Set();
    return arr.filter((i) => {
      const id = i.itemId || i.itemCode;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [globalItems, itemSearch]);

  const filteredRooms = useMemo(() => {
    const q = roomSearch.trim().toLowerCase();
    return q
      ? rooms.filter((r) => r.roomName.toLowerCase().includes(q))
      : rooms;
  }, [rooms, roomSearch]);

  /* ── derived state ── */
  const selectedRoomIds = Object.keys(roomItems);
  const selectedRoomCount = selectedRoomIds.length;

  const totalSelectedItems = useMemo(
    () =>
      selectedRoomIds.reduce(
        (sum, rid) => sum + Object.keys(roomItems[rid]).length,
        0,
      ),
    [roomItems, selectedRoomIds],
  );

  const allCountsValid = useMemo(
    () =>
      selectedRoomIds.every((rid) =>
        Object.values(roomItems[rid]).every(
          (cnt) => !validatePackageCount(cnt),
        ),
      ),
    [roomItems, selectedRoomIds],
  );

  const hasAnyItem = totalSelectedItems > 0;

  const canConfirm =
    selectedRoomCount > 0 && hasAnyItem && allCountsValid && !submitting;

  /* ── room actions ── */
  const toggleRoom = useCallback((roomId) => {
    setRoomItems((prev) => {
      if (prev[roomId] !== undefined) {
        const next = { ...prev };
        delete next[roomId];
        return next;
      }
      return { ...prev, [roomId]: {} };
    });
  }, []);

  const removeRoom = useCallback((roomId) => {
    setRoomItems((prev) => {
      const next = { ...prev };
      delete next[roomId];
      return next;
    });
  }, []);

  const clearAllRooms = () => setRoomItems({});

  /* ── item actions per room ── */
  const toggleItemInRoom = useCallback((roomId, itemId) => {
    setRoomItems((prev) => {
      const room = { ...(prev[roomId] || {}) };
      if (room[itemId] !== undefined) {
        delete room[itemId];
      } else {
        room[itemId] = 1;
      }
      return { ...prev, [roomId]: room };
    });
  }, []);

  const setCountInRoom = useCallback((roomId, itemId, val) => {
    setRoomItems((prev) => ({
      ...prev,
      [roomId]: { ...(prev[roomId] || {}), [itemId]: val },
    }));
  }, []);

  /* ── confirm / submit ── */
  const handleConfirm = () => {
    if (!canConfirm) return;
    setConfirmOpen(true);
  };

  const handleFinalConfirm = async () => {
    const roomTargets = selectedRoomIds.map((roomId) => ({
      roomId,
      items: Object.entries(roomItems[roomId]).map(([itemId, cnt]) => ({
        itemId,
        packageCount: Number(cnt),
      })),
    }));

    let success;
    if (mode === "allocate") {
      success = await allocate(roomTargets, note);
    } else {
      success = await revoke(roomTargets, note);
    }

    if (success) {
      setRoomItems({});
      setNote("");
      setConfirmOpen(false);
    }
  };

  /* ── step status ── */
  const step1Status = selectedRoomCount > 0 ? "done" : "active";
  const step2Status =
    selectedRoomCount === 0
      ? "idle"
      : hasAnyItem && allCountsValid
        ? "done"
        : "active";
  const step3Status = !canConfirm ? "idle" : "active";

  /* ── render ── */
  return (
    <div className="stp-root">
      {/* ── Mode tabs ── */}
      <div className="stp-tabs">
        <button
          className={`stp-tab ${mode === "allocate" ? "stp-tab--active" : ""}`}
          onClick={() => switchMode("allocate")}
        >
          <SendOutlined style={{ fontSize: 16 }} />
          Phân phối vào phòng
        </button>
        <button
          className={`stp-tab ${mode === "revoke" ? "stp-tab--active stp-tab--revoke" : ""}`}
          onClick={() => switchMode("revoke")}
        >
          <UndoOutlined style={{ fontSize: 16 }} />
          Thu hồi từ phòng
        </button>
      </div>

      {/* ── Body: 3-column layout ── */}
      <div className="stp-body stp-body--3col">
        {/* ══ COL 1: Chọn phòng ══ */}
        <div className="stp-col stp-col--rooms" style={{ gridColumn: "1" }}>
          <div className="stp-card stp-card--full-height">
            <div className="stp-card__header">
              <StepDot num={1} status={step1Status} />
              <div className="stp-card__title">
                <span>
                  {mode === "allocate"
                    ? "Chọn phòng nhận"
                    : "Chọn phòng thu hồi"}
                </span>
                <CountBadge count={selectedRoomCount} />
              </div>
              <span className="stp-card__sub">Chọn nhiều được</span>
              {selectedRoomCount > 0 && (
                <button
                  className="stp-clear-all-btn"
                  onClick={clearAllRooms}
                  title="Xoá tất cả phòng"
                >
                  <DeleteSweepOutlined style={{ fontSize: 15 }} />
                  Xoá tất cả
                </button>
              )}
            </div>

            <div className="stp-search-row">
              <DomainOutlined
                style={{ fontSize: 16, color: "var(--stp-muted)" }}
              />
              <input
                className="stp-input"
                placeholder="Tìm phòng..."
                value={roomSearch}
                onChange={(e) =>
                  setRoomSearch(filterSearchInput(e.target.value))
                }
              />
              {roomSearch && (
                <button
                  className="stp-clear-btn"
                  onClick={() => setRoomSearch("")}
                  aria-label="Xoá"
                >
                  <CloseOutlined style={{ fontSize: 14 }} />
                </button>
              )}
            </div>

            {filteredRooms.length === 0 ? (
              <div className="stp-empty stp-empty--sm">
                Không tìm thấy phòng nào đang hoạt động
              </div>
            ) : (
              <div className="stp-room-list stp-room-list--full">
                {filteredRooms.map((room) => {
                  const sel = roomItems[room.roomId] !== undefined;
                  const cnt = sel
                    ? Object.keys(roomItems[room.roomId]).length
                    : 0;
                  return (
                    <button
                      key={room.roomId}
                      className={`stp-room-item ${sel ? "stp-room-item--selected" : ""}`}
                      onClick={() => toggleRoom(room.roomId)}
                      aria-pressed={sel}
                    >
                      <DomainOutlined style={{ fontSize: 18, flexShrink: 0 }} />
                      <div className="stp-room-item__info">
                        <span className="stp-room-item__name">
                          {room.roomName}
                        </span>
                        {room.staffCount > 0 && (
                          <span className="stp-room-item__staff">
                            {room.staffCount} nhân viên
                          </span>
                        )}
                      </div>
                      {sel && (
                        <>
                          {cnt > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#059669",
                                marginLeft: "auto",
                                marginRight: 4,
                                flexShrink: 0,
                              }}
                            >
                              {cnt} HC
                            </span>
                          )}
                          <CheckCircleOutlined
                            style={{ fontSize: 16, flexShrink: 0 }}
                          />
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ COL 2: Hóa chất cho từng phòng ══ */}
        <div
          className={`stp-col stp-col--items ${selectedRoomCount === 0 ? "" : ""}`}
          style={{ gridColumn: "2" }}
        >
          <div
            className={`stp-card ${selectedRoomCount === 0 ? "stp-card--dim" : ""}`}
          >
            <div className="stp-card__header">
              <StepDot num={2} status={step2Status} />
              <div className="stp-card__title">
                <span>Chọn hóa chất theo phòng</span>
                {hasAnyItem && <CountBadge count={totalSelectedItems} />}
              </div>
              <span className="stp-card__sub">Mỗi phòng có số lượng riêng</span>
            </div>

            {/* search bar hóa chất */}
            <div className="stp-search-row">
              <SearchOutlined
                style={{ fontSize: 16, color: "var(--stp-muted)" }}
              />
              <input
                className="stp-input"
                placeholder="Tìm theo tên, mã, công thức, nhà cung cấp..."
                value={itemSearch}
                onChange={(e) =>
                  setItemSearch(filterSearchInput(e.target.value))
                }
              />
              {itemSearch && (
                <button
                  className="stp-clear-btn"
                  onClick={() => setItemSearch("")}
                  aria-label="Xoá tìm kiếm"
                >
                  <CloseOutlined style={{ fontSize: 14 }} />
                </button>
              )}
            </div>

            {selectedRoomCount === 0 ? (
              <div className="stp-empty">
                <DomainOutlined style={{ fontSize: 32, opacity: 0.3 }} />
                <span>Vui lòng chọn ít nhất 1 phòng trước</span>
              </div>
            ) : loading ? (
              <div className="stp-loading">
                <span className="stp-spinner" /> Đang tải hóa chất...
              </div>
            ) : (
              <div className="stp-room-sections">
                {selectedRoomIds.map((roomId) => {
                  const room = rooms.find((r) => r.roomId === roomId);
                  if (!room) return null;
                  return (
                    <RoomItemSection
                      key={roomId}
                      room={room}
                      items={filteredItems}
                      roomItems={roomItems[roomId]}
                      onToggleItem={(itemId) =>
                        toggleItemInRoom(roomId, itemId)
                      }
                      onChangeCount={(itemId, val) =>
                        setCountInRoom(roomId, itemId, val)
                      }
                      onRemoveRoom={removeRoom}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ COL 3: Xác nhận ══ */}
        <div className="stp-col stp-col--confirm" style={{ gridColumn: "3" }}>
          <div
            className={`stp-card stp-card--full-height stp-confirm-card ${
              !hasAnyItem ? "stp-card--dim" : ""
            }`}
          >
            <div className="stp-card__header">
              <StepDot num={3} status={step3Status} />
              <div className="stp-card__title">Xác nhận & Gửi</div>
            </div>

            {/* Summary */}
            <div className="stp-summary">
              <div className="stp-summary__row">
                <span className="stp-summary__label">Phòng</span>
                <span className="stp-summary__val">
                  {selectedRoomCount > 0 ? (
                    `${selectedRoomCount} phòng`
                  ) : (
                    <span className="stp-summary__missing">Chưa chọn</span>
                  )}
                </span>
              </div>
              <div className="stp-summary__row">
                <span className="stp-summary__label">Hóa chất</span>
                <span className="stp-summary__val">
                  {hasAnyItem ? (
                    `${totalSelectedItems} lượt`
                  ) : (
                    <span className="stp-summary__missing">Chưa chọn</span>
                  )}
                </span>
              </div>

              {/* Chi tiết từng phòng */}
              {selectedRoomCount > 0 && hasAnyItem && (
                <div className="stp-summary__items stp-summary__items--expanded">
                  {selectedRoomIds.map((roomId) => {
                    const room = rooms.find((r) => r.roomId === roomId);
                    if (!room) return null;
                    const items = roomItems[roomId];
                    const itemIds = Object.keys(items);
                    if (itemIds.length === 0) return null;
                    return (
                      <div key={roomId} className="stp-summary__room-block">
                        <div className="stp-summary__room-label">
                          <DomainOutlined
                            style={{ fontSize: 12, color: "#059669" }}
                          />
                          {room.roomName}
                        </div>
                        {itemIds.map((itemId) => {
                          const item = globalItems.find(
                            (i) => i.itemId === itemId || i.itemCode === itemId,
                          );
                          if (!item) return null;
                          const cnt = items[itemId];
                          const err = validatePackageCount(cnt);
                          return (
                            <div
                              key={itemId}
                              className={`stp-summary__chip stp-summary__chip--lg ${err ? "stp-summary__chip--err" : ""}`}
                            >
                              <span className="stp-summary__chip-name">
                                {item.itemName}
                              </span>
                              {err ? (
                                <span
                                  style={{ color: "#dc2626", fontSize: 11 }}
                                >
                                  {err}
                                </span>
                              ) : (
                                <span className="stp-summary__chip-qty">
                                  {cnt} {item.packaging || "gói"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {!allCountsValid && hasAnyItem && (
                <div className="stp-warn">
                  <WarningAmberOutlined style={{ fontSize: 14 }} />
                  Vui lòng nhập đủ số gói hợp lệ
                </div>
              )}
            </div>

            {/* Note */}
            <div className="stp-note-row">
              <StickyNote2Outlined
                style={{
                  fontSize: 15,
                  color: "var(--stp-muted)",
                  flexShrink: 0,
                }}
              />
              <input
                className="stp-input"
                placeholder="Ghi chú (không bắt buộc)..."
                value={note}
                onChange={(e) => setNote(sanitizeNote(e.target.value))}
                maxLength={255}
              />
            </div>

            {/* Confirm button */}
            <button
              className={`stp-confirm-btn ${mode === "revoke" ? "stp-confirm-btn--revoke" : ""}`}
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              {submitting ? (
                <>
                  <span className="stp-spinner stp-spinner--white" />
                  Đang xử lý...
                </>
              ) : mode === "allocate" ? (
                <>
                  <SendOutlined style={{ fontSize: 17 }} />
                  Xác nhận phân phối
                </>
              ) : (
                <>
                  <UndoOutlined style={{ fontSize: 17 }} />
                  Xác nhận thu hồi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Confirmation Dialog ── */}
      {confirmOpen && (
        <div
          className="stp-dialog-overlay"
          onClick={() => setConfirmOpen(false)}
        >
          <div className="stp-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div
              className={`stp-dialog__header ${mode === "revoke" ? "stp-dialog__header--revoke" : ""}`}
            >
              <div className="stp-dialog__icon">
                {mode === "allocate" ? (
                  <SendOutlined style={{ fontSize: 22 }} />
                ) : (
                  <UndoOutlined style={{ fontSize: 22 }} />
                )}
              </div>
              <div>
                <div className="stp-dialog__title">
                  {mode === "allocate"
                    ? "Xác nhận phân phối"
                    : "Xác nhận thu hồi"}
                </div>
                <div className="stp-dialog__sub">
                  {mode === "allocate"
                    ? "Kiểm tra lại thông tin trước khi gửi"
                    : "Hành động này sẽ thu hồi vật tư khỏi các phòng đã chọn"}
                </div>
              </div>
            </div>

            {/* Body — hiển thị theo từng phòng */}
            <div className="stp-dialog__body">
              {selectedRoomIds.map((roomId) => {
                const room = rooms.find((r) => r.roomId === roomId);
                if (!room) return null;
                const items = roomItems[roomId];
                const itemIds = Object.keys(items);
                return (
                  <div key={roomId} style={{ marginBottom: 14 }}>
                    <div className="stp-dialog__section-label">
                      <DomainOutlined style={{ fontSize: 14 }} />
                      {room.roomName}
                    </div>
                    <div className="stp-dialog__list">
                      {itemIds.length === 0 ? (
                        <div
                          style={{
                            padding: "4px 0",
                            fontSize: 12,
                            color: "#94a3b8",
                          }}
                        >
                          Không có hóa chất
                        </div>
                      ) : (
                        itemIds.map((itemId) => {
                          const item = globalItems.find(
                            (i) => i.itemId === itemId || i.itemCode === itemId,
                          );
                          if (!item) return null;
                          return (
                            <div key={itemId} className="stp-dialog__row">
                              <span className="stp-dialog__row-name">
                                {item.itemName}
                              </span>
                              <span className="stp-dialog__row-qty">
                                {items[itemId]} {item.packaging || "gói"}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}

              {note && (
                <div className="stp-dialog__note">
                  <StickyNote2Outlined
                    style={{ fontSize: 13, flexShrink: 0 }}
                  />
                  <span>{note}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="stp-dialog__footer">
              <button
                className="stp-dialog__cancel-btn"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                Quay lại
              </button>
              <button
                className={`stp-dialog__ok-btn ${mode === "revoke" ? "stp-dialog__ok-btn--revoke" : ""}`}
                onClick={handleFinalConfirm}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="stp-spinner stp-spinner--white" />
                    Đang xử lý...
                  </>
                ) : mode === "allocate" ? (
                  <>
                    <SendOutlined style={{ fontSize: 16 }} />
                    Xác nhận phân phối
                  </>
                ) : (
                  <>
                    <UndoOutlined style={{ fontSize: 16 }} />
                    Xác nhận thu hồi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
