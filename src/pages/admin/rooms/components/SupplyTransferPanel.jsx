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
} from "@mui/icons-material";

import { useInventory } from "../hooks/useInventory";
import "../styles/supply.css";

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
    onToggle(item);
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

export default function SupplyTransferPanel({ rooms = [] }) {
  const { globalItems, loading, submitting, allocate, revoke } = useInventory();

  const [mode, setMode] = useState("allocate");
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState(new Set());
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const switchMode = useCallback((m) => {
    setMode(m);
    setSelectedItems({});
    setSelectedRoomIds(new Set());
    setNote("");
    setItemSearch("");
    setRoomSearch("");
  }, []);

  const handleItemSearchChange = (e) => {
    setItemSearch(filterSearchInput(e.target.value));
  };

  const handleRoomSearchChange = (e) => {
    setRoomSearch(filterSearchInput(e.target.value));
  };

  const handleNoteChange = (e) => {
    setNote(sanitizeNote(e.target.value));
  };

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

  const selectedItemIds = Object.keys(selectedItems);
  const selectedItemCount = selectedItemIds.length;
  const selectedRoomCount = selectedRoomIds.size;

  const allCountsValid = useMemo(
    () =>
      selectedItemIds.every((id) => !validatePackageCount(selectedItems[id])),
    [selectedItems, selectedItemIds],
  );

  const canConfirm =
    selectedItemCount > 0 &&
    selectedRoomCount > 0 &&
    allCountsValid &&
    !submitting;

  const toggleItem = (item) => {
    const uid = item.itemId || item.itemCode;
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[uid] !== undefined) {
        delete next[uid];
      } else {
        next[uid] = 1;
      }
      return next;
    });
  };

  const setCount = (uid, val) => {
    setSelectedItems((prev) => ({ ...prev, [uid]: val }));
  };

  const toggleRoom = (roomId) => {
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const clearAllItems = () => setSelectedItems({});
  const clearAllRooms = () => setSelectedRoomIds(new Set());

  const handleConfirm = () => {
    if (!canConfirm) return;
    setConfirmOpen(true);
  };


  const handleFinalConfirm = async () => {
    // Mảng items chung cho mọi phòng
    const itemsPayload = selectedItemIds.map((id) => ({
      itemId: id,
      packageCount: Number(selectedItems[id]),
    }));

    // Mỗi phòng nhận cùng bộ items
    const roomTargets = Array.from(selectedRoomIds).map((roomId) => ({
      roomId,
      items: itemsPayload,
    }));

    let success;
    if (mode === "allocate") {
      // key "allocations" khớp với AllocateRequestDTO
      success = await allocate(roomTargets, note);
    } else {
      // key "revocations" khớp với RevokeRequestDTO
      success = await revoke(roomTargets, note);
    }

    if (success) {
      setSelectedItems({});
      setSelectedRoomIds(new Set());
      setNote("");
      setConfirmOpen(false);
    }
  };

  const step1Status =
    selectedItemCount > 0 && allCountsValid ? "done" : "active";
  const step2Status = !selectedItemCount
    ? "idle"
    : selectedRoomCount > 0
      ? "done"
      : "active";
  const step3Status = !canConfirm ? "idle" : "active";

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
        {/* ══ COL 1: Chọn hóa chất ══ */}
        <div className="stp-col stp-col--items">
          <div className="stp-card">
            <div className="stp-card__header">
              <StepDot num={1} status={step1Status} />
              <div className="stp-card__title">
                <span>Chọn hóa chất</span>
                <CountBadge count={selectedItemCount} />
              </div>
              <span className="stp-card__sub">
                Nhập số{" "}
                {mode === "allocate" ? "chai/gói" : "chai/gói cần thu hồi"} sau
                khi chọn
              </span>
              {selectedItemCount > 0 && (
                <button
                  className="stp-clear-all-btn"
                  onClick={clearAllItems}
                  title="Xoá tất cả hóa chất đã chọn"
                >
                  <DeleteSweepOutlined style={{ fontSize: 15 }} />
                  Xoá tất cả
                </button>
              )}
            </div>

            <div className="stp-search-row">
              <SearchOutlined
                style={{ fontSize: 16, color: "var(--stp-muted)" }}
              />
              <input
                className="stp-input"
                placeholder="Tìm theo tên, mã, công thức, nhà cung cấp..."
                value={itemSearch}
                onChange={handleItemSearchChange}
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

            {loading ? (
              <div className="stp-loading">
                <span className="stp-spinner" /> Đang tải hóa chất...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="stp-empty">
                <Inventory2Outlined style={{ fontSize: 32, opacity: 0.3 }} />
                <span>Không tìm thấy hóa chất</span>
              </div>
            ) : (
              <div className="stp-item-grid">
                {filteredItems.map((item) => {
                  const uid = item.itemId || item.itemCode;
                  return (
                    <ItemCard
                      key={uid}
                      item={item}
                      selected={selectedItems[uid] !== undefined}
                      packageCount={selectedItems[uid]}
                      onToggle={toggleItem}
                      onChangeCount={setCount}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ COL 2: Chọn phòng ══ */}
        <div className="stp-col stp-col--rooms">
          <div
            className={`stp-card stp-card--full-height ${selectedItemCount === 0 ? "stp-card--dim" : ""}`}
          >
            <div className="stp-card__header">
              <StepDot num={2} status={step2Status} />
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
                  title="Xoá tất cả phòng đã chọn"
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
                onChange={handleRoomSearchChange}
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
                  const sel = selectedRoomIds.has(room.roomId);
                  return (
                    <button
                      key={room.roomId}
                      className={`stp-room-item ${sel ? "stp-room-item--selected" : ""} ${
                        selectedItemCount === 0 ? "stp-room-item--dim" : ""
                      }`}
                      onClick={() =>
                        selectedItemCount > 0 && toggleRoom(room.roomId)
                      }
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
                        <CheckCircleOutlined
                          style={{
                            fontSize: 16,
                            marginLeft: "auto",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ COL 3: Xác nhận ══ */}
        <div className="stp-col stp-col--confirm">
          <div
            className={`stp-card stp-card--full-height stp-confirm-card ${!selectedItemCount ? "stp-card--dim" : ""}`}
          >
            <div className="stp-card__header">
              <StepDot num={3} status={step3Status} />
              <div className="stp-card__title">Xác nhận & Gửi</div>
            </div>

            {/* Summary */}
            <div className="stp-summary">
              <div className="stp-summary__row">
                <span className="stp-summary__label">Hóa chất</span>
                <span className="stp-summary__val">
                  {selectedItemCount > 0 ? (
                    `${selectedItemCount} loại`
                  ) : (
                    <span className="stp-summary__missing">Chưa chọn</span>
                  )}
                </span>
              </div>
              <div className="stp-summary__row">
                <span className="stp-summary__label">
                  {mode === "allocate" ? "Phòng nhận" : "Phòng thu hồi"}
                </span>
                <span className="stp-summary__val">
                  {selectedRoomCount > 0 ? (
                    `${selectedRoomCount} phòng`
                  ) : (
                    <span className="stp-summary__missing">Chưa chọn</span>
                  )}
                </span>
              </div>

              {selectedRoomCount > 0 && (
                <div className="stp-summary__items stp-summary__items--expanded">
                  {Array.from(selectedRoomIds).map((roomId) => {
                    const room = rooms.find((r) => r.roomId === roomId);
                    if (!room) return null;
                    return (
                      <div
                        key={roomId}
                        className="stp-summary__chip stp-summary__chip--lg stp-summary__chip--room"
                      >
                        <DomainOutlined
                          style={{
                            fontSize: 13,
                            flexShrink: 0,
                            color: "#059669",
                          }}
                        />
                        <span className="stp-summary__chip-name">
                          {room.roomName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedItemCount > 0 && allCountsValid && (
                <div className="stp-summary__items stp-summary__items--expanded">
                  {selectedItemIds.map((id) => {
                    const item = globalItems.find(
                      (i) => i.itemId === id || i.itemCode === id,
                    );
                    if (!item) return null;
                    return (
                      <div
                        key={id}
                        className="stp-summary__chip stp-summary__chip--lg"
                      >
                        <span className="stp-summary__chip-name">
                          {item.itemName}
                        </span>
                        <span className="stp-summary__chip-qty">
                          {selectedItems[id]} {item.packaging || "gói"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {!allCountsValid && selectedItemCount > 0 && (
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
                onChange={handleNoteChange}
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

            {/* Body */}
            <div className="stp-dialog__body">
              {/* Hóa chất */}
              <div className="stp-dialog__section-label">
                <Inventory2Outlined style={{ fontSize: 14 }} />
                Hóa chất ({selectedItemCount} loại)
              </div>
              <div className="stp-dialog__list">
                {selectedItemIds.map((id) => {
                  const item = globalItems.find(
                    (i) => i.itemId === id || i.itemCode === id,
                  );
                  if (!item) return null;
                  return (
                    <div key={id} className="stp-dialog__row">
                      <span className="stp-dialog__row-name">
                        {item.itemName}
                      </span>
                      <span className="stp-dialog__row-qty">
                        {selectedItems[id]} {item.packaging || "gói"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Phòng */}
              <div
                className="stp-dialog__section-label"
                style={{ marginTop: 12 }}
              >
                <DomainOutlined style={{ fontSize: 14 }} />
                {mode === "allocate" ? "Phòng nhận" : "Phòng thu hồi"} (
                {selectedRoomCount} phòng)
              </div>
              <div className="stp-dialog__list">
                {Array.from(selectedRoomIds).map((roomId) => {
                  const room = rooms.find((r) => r.roomId === roomId);
                  if (!room) return null;
                  return (
                    <div key={roomId} className="stp-dialog__row">
                      <DomainOutlined
                        style={{
                          fontSize: 13,
                          color: "#059669",
                          flexShrink: 0,
                        }}
                      />
                      <span className="stp-dialog__row-name">
                        {room.roomName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Ghi chú */}
              {note && (
                <div className="stp-dialog__note">
                  <StickyNote2Outlined
                    style={{ fontSize: 13, flexShrink: 0 }}
                  />
                  <span>{note}</span>
                </div>
              )}
            </div>

            {/* Footer buttons */}
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
