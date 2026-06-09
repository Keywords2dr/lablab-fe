import React, { useState, useMemo, useCallback } from "react";
import {
  UndoOutlined,
  SearchOutlined,
  CloseOutlined,
  DomainOutlined,
  StickyNote2Outlined,
  WarningAmberOutlined,
  ScienceOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
} from "@mui/icons-material";

import { useInventory } from "../hooks/useInventory";
import { useRoomInventories } from "../hooks/useRoomInventories";
import { sanitizeNote, filterSearchInput, validatePackageCount, getMaxPackages } from "../utils/supplyHelpers";
import CountBadge from "./shared/CountBadge";
import StepDot from "./shared/StepDot";
import SupplyConfirmDialog from "./shared/SupplyConfirmDialog";
import ItemCardBase from "./shared/ItemCardBase";

function ItemCardRevoke({ item, selected, packageCount, onToggle, onChangeCount, maxQuantity }) {
  const uid = item.itemId || item.itemCode;
  const maxPkgs = getMaxPackages(maxQuantity, item.amountPerPackage);
  let error = selected ? validatePackageCount(packageCount) : false;
  
  if (!error && selected) {
    if (packageCount > maxPkgs) {
      error = "Vượt tồn";
    }
  }

  return (
    <ItemCardBase
      selected={selected}
      error={error}
      onToggle={() => onToggle(uid)}
      packageCount={packageCount}
      onChangeCount={(val) => onChangeCount(uid, val)}
      maxPackages={maxPkgs}
      inputAriaLabel={`Số lượng ${item.itemName}`}
    >
      <div className="stp-item-card__name">{item.itemName}</div>
      <div className="stp-item-card__code">{item.itemCode}</div>
      <div className="stp-item-card__meta" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {item.formula && (
          <span className="stp-item-card__cat" style={{ alignSelf: 'flex-start' }}>{item.formula}</span>
        )}
        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span>Tổng: {item.totalQuantity !== undefined ? item.totalQuantity : "?"}</span>
          <span>Khóa: {item.lockedQuantity !== undefined ? item.lockedQuantity : "?"}</span>
          <span style={{ color: '#059669', fontWeight: 600 }}>Khả dụng: {maxQuantity} {item.unit || "gói"}</span>
        </div>
        {item.amountPerPackage && (
          <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 500 }}>
            Quy cách: {item.amountPerPackage} {item.unit} / {item.packaging || "gói"}
          </div>
        )}
      </div>
    </ItemCardBase>
  );
}

function RoomItemSectionRevoke({
  room,
  items,
  roomItemsData,
  onToggleItem,
  onChangeCount,
  onRemoveRoom,
  globalItems
}) {
  const [expanded, setExpanded] = useState(true);
  const roomItems = roomItemsData[room.roomId] || {};
  const selectedCount = Object.keys(roomItems).length;

  let hasError = false;
  Object.entries(roomItems).forEach(([itemId, cnt]) => {
    let err = validatePackageCount(cnt);
    if (!err) {
      const itemInv = items.find(i => i.itemId === itemId || i.itemCode === itemId);
      const itemGlobal = globalItems.find(i => i.itemId === itemId || i.itemCode === itemId);
      if (itemInv) {
        const maxPkgs = getMaxPackages(itemInv.availableQuantity, itemGlobal?.amountPerPackage);
        if (cnt > maxPkgs) {
          err = "Vượt tồn";
        }
      }
    }
    if (err) hasError = true;
  });

  return (
    <div className="stp-room-section">
      <div className={`stp-room-section__header ${hasError && selectedCount > 0 ? "stp-room-section__header--warn" : ""}`}>
        <button
          className="stp-room-section__toggle"
          onClick={() => setExpanded((v) => !v)}
        >
          <DomainOutlined style={{ fontSize: 16, flexShrink: 0 }} />
          <span className="stp-room-section__name">{room.roomName}</span>
          {selectedCount > 0 && (
            <span className="stp-room-section__count">
              {selectedCount} hóa chất
              {hasError && <WarningAmberOutlined style={{ fontSize: 13, color: "#d97706", marginLeft: 3 }} />}
            </span>
          )}
          {expanded ? <ExpandLessOutlined style={{ fontSize: 18, marginLeft: "auto" }} /> : <ExpandMoreOutlined style={{ fontSize: 18, marginLeft: "auto" }} />}
        </button>
        <button className="stp-room-section__remove" onClick={() => onRemoveRoom(room.roomId)}>
          <CloseOutlined style={{ fontSize: 14 }} />
        </button>
      </div>

      {expanded && (
        <div className="stp-room-section__body">
          {items.length === 0 ? (
            <div className="stp-empty stp-empty--sm">Không có hóa chất</div>
          ) : (
            <div className="stp-item-grid stp-item-grid--compact">
              {items.map(item => {
                const uid = item.itemId || item.itemCode;
                const globalItem = globalItems.find(g => g.itemId === uid || g.itemCode === uid);
                return (
                  <ItemCardRevoke
                    key={uid}
                    item={{...item, ...globalItem}}
                    selected={roomItems[uid] !== undefined}
                    packageCount={roomItems[uid]}
                    onToggle={() => onToggleItem(room.roomId, uid)}
                    onChangeCount={(id, val) => onChangeCount(room.roomId, uid, val)}
                    maxQuantity={item.availableQuantity}
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

export default function SupplyRevokePanel({ rooms = [] }) {
  const { globalItems, submitting, revoke } = useInventory();
  const { inventories, loading: invLoading, fetchInventories } = useRoomInventories();

  const [subMode, setSubMode] = useState("byRoom"); // byRoom | byItem
  
  // States for byRoom
  const [selectedRoomsForByRoom, setSelectedRoomsForByRoom] = useState([]);
  const [roomItemsData, setRoomItemsData] = useState({}); // { roomId: { itemId: count } }
  
  // States for byItem
  const [selectedItemForByItem, setSelectedItemForByItem] = useState(null);
  const [itemRoomsData, setItemRoomsData] = useState({}); // { itemId: { roomId: count } }

  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSwitchSubMode = (mode) => {
    setSubMode(mode);
    setSearch1("");
    setSearch2("");
    setNote("");
    if (mode === "byItem") {
      const allRoomIds = rooms.map(r => r.roomId);
      fetchInventories(allRoomIds);
      setSelectedItemForByItem(null);
      setItemRoomsData({});
    } else {
      setSelectedRoomsForByRoom([]);
      setRoomItemsData({});
    }
  };

  // ----- BY ROOM LOGIC -----
  const toggleRoomInByRoom = (roomId) => {
    if (selectedRoomsForByRoom.includes(roomId)) {
      setSelectedRoomsForByRoom(prev => prev.filter(id => id !== roomId));
      setRoomItemsData(prev => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    } else {
      setSelectedRoomsForByRoom(prev => [...prev, roomId]);
      if (!inventories[roomId]) {
        fetchInventories([roomId]);
      }
      setRoomItemsData(prev => ({ ...prev, [roomId]: {} }));
    }
  };

  const toggleItemInByRoom = (roomId, itemId) => {
    setRoomItemsData(prev => {
      const roomData = { ...(prev[roomId] || {}) };
      if (roomData[itemId] !== undefined) {
        delete roomData[itemId];
      } else {
        roomData[itemId] = 1;
      }
      return { ...prev, [roomId]: roomData };
    });
  };

  const setCountInByRoom = (roomId, itemId, val) => {
    setRoomItemsData(prev => ({
      ...prev,
      [roomId]: { ...(prev[roomId] || {}), [itemId]: val }
    }));
  };

  // ----- BY ITEM LOGIC -----
  const itemsInRooms = useMemo(() => {
    const map = {};
    Object.values(inventories).forEach(roomInv => {
      roomInv.forEach(item => {
        const id = item.itemId || item.itemCode;
        if (!map[id]) {
          map[id] = { ...item, totalAvailableGlobal: 0 };
        }
        map[id].totalAvailableGlobal += Number(item.availableQuantity || 0);
      });
    });
    return Object.values(map).filter(i => i.totalAvailableGlobal > 0);
  }, [inventories]);

  const toggleRoomInByItem = (roomId) => {
    if (!selectedItemForByItem) return;
    setItemRoomsData(prev => {
      const itemData = { ...(prev[selectedItemForByItem] || {}) };
      if (itemData[roomId] !== undefined) {
        delete itemData[roomId];
      } else {
        itemData[roomId] = 1;
      }
      return { ...prev, [selectedItemForByItem]: itemData };
    });
  };

  const setCountInByItem = (roomId, val) => {
    if (!selectedItemForByItem) return;
    setItemRoomsData(prev => ({
      ...prev,
      [selectedItemForByItem]: { ...(prev[selectedItemForByItem] || {}), [roomId]: val }
    }));
  };


  // ----- SHARED LOGIC -----
  let canConfirm = false;
  let summaryData = [];
  
  if (subMode === "byRoom") {
    summaryData = selectedRoomsForByRoom.map(roomId => {
      const room = rooms.find(r => r.roomId === roomId);
      const itemsMap = roomItemsData[roomId] || {};
      const itemsList = Object.entries(itemsMap).map(([itemId, count]) => {
        const itemInv = (inventories[roomId] || []).find(i => (i.itemId === itemId || i.itemCode === itemId));
        const itemGlobal = globalItems.find(i => (i.itemId === itemId || i.itemCode === itemId));
        let error = validatePackageCount(count);
        if (!error && itemInv) {
           const maxPkgs = getMaxPackages(itemInv.availableQuantity, itemGlobal?.amountPerPackage);
           if (count > maxPkgs) {
             error = "Vượt tồn";
           }
        }
        return { itemId, count, error, itemName: itemInv?.itemName || "Unknown", packaging: itemGlobal?.packaging || "gói" };
      });
      return { roomId, roomName: room?.roomName, items: itemsList };
    }).filter(d => d.items.length > 0);
    
    canConfirm = summaryData.length > 0 && summaryData.every(d => d.items.every(i => !i.error)) && !submitting;
  } else {
    // Collect all items across all rooms
    const roomItemsMap = {}; // { roomId: { items: [...] } }
    Object.entries(itemRoomsData).forEach(([itemId, roomsMap]) => {
      const itemGlobal = globalItems.find(i => (i.itemId === itemId || i.itemCode === itemId));
      Object.entries(roomsMap).forEach(([roomId, count]) => {
        const itemInv = (inventories[roomId] || []).find(i => (i.itemId === itemId || i.itemCode === itemId));
        let error = validatePackageCount(count);
        if (!error && itemInv) {
           const maxPkgs = getMaxPackages(itemInv.availableQuantity, itemGlobal?.amountPerPackage);
           if (count > maxPkgs) {
             error = "Vượt tồn";
           }
        }
        if (!roomItemsMap[roomId]) {
          const room = rooms.find(r => r.roomId === roomId);
          roomItemsMap[roomId] = { roomId, roomName: room?.roomName, items: [] };
        }
        roomItemsMap[roomId].items.push({
          itemId, count, error, itemName: itemGlobal?.itemName || "Unknown", packaging: itemGlobal?.packaging || "gói"
        });
      });
    });
    
    summaryData = Object.values(roomItemsMap).filter(d => d.items.length > 0);
    canConfirm = summaryData.length > 0 && summaryData.every(d => d.items.every(i => !i.error)) && !submitting;
  }

  const handleFinalConfirm = async () => {
    const roomTargets = summaryData.map(d => ({
      roomId: d.roomId,
      items: d.items.map(i => ({
        itemId: i.itemId,
        packageCount: Number(i.count)
      }))
    }));

    const success = await revoke(roomTargets, note);
    if (success) {
      if (subMode === "byRoom") {
        setRoomItemsData({});
        setSelectedRoomsForByRoom([]);
      } else {
        setItemRoomsData({});
        setSelectedItemForByItem(null);
      }
      setNote("");
      setConfirmOpen(false);
      fetchInventories(rooms.map(r => r.roomId));
    }
  };

  return (
    <div className="stp-root">
      <div className="stp-tabs--sub">
        <button
          className={`stp-tab--sub ${subMode === "byRoom" ? "stp-tab--active" : ""}`}
          onClick={() => handleSwitchSubMode("byRoom")}
        >
          <DomainOutlined style={{ fontSize: 16 }} /> Chọn theo phòng
        </button>
        <button
          className={`stp-tab--sub ${subMode === "byItem" ? "stp-tab--active" : ""}`}
          onClick={() => handleSwitchSubMode("byItem")}
        >
          <ScienceOutlined style={{ fontSize: 16 }} /> Chọn theo hóa chất
        </button>
      </div>

      <div className="stp-body stp-body--3col">
        {/* COL 1 */}
        <div className="stp-col" style={{ gridColumn: "1" }}>
          <div className="stp-card stp-card--full-height">
            <div className="stp-card__header">
              <StepDot num={1} status={subMode === "byRoom" ? (selectedRoomsForByRoom.length > 0 ? "done" : "active") : (selectedItemForByItem ? "done" : "active")} />
              <div className="stp-card__title">
                {subMode === "byRoom" ? "Chọn phòng thu hồi" : "Chọn hóa chất cần thu hồi"}
              </div>
            </div>
            
            <div className="stp-search-row">
              <SearchOutlined style={{ fontSize: 16, color: "var(--stp-muted)" }} />
              <input
                className="stp-input"
                placeholder={subMode === "byRoom" ? "Tìm phòng..." : "Tìm hóa chất..."}
                value={search1}
                onChange={(e) => setSearch1(filterSearchInput(e.target.value))}
              />
            </div>

            <div className="stp-room-list stp-room-list--full">
              {subMode === "byRoom" ? (
                rooms.filter(r => !search1 || r.roomName.toLowerCase().includes(search1.toLowerCase())).map(room => {
                  const sel = selectedRoomsForByRoom.includes(room.roomId);
                  return (
                    <button key={room.roomId} className={`stp-room-item ${sel ? "stp-room-item--selected" : ""}`} onClick={() => toggleRoomInByRoom(room.roomId)}>
                      <DomainOutlined style={{ fontSize: 18 }} />
                      <div className="stp-room-item__info">
                        <span className="stp-room-item__name">{room.roomName}</span>
                      </div>
                      {sel && (
                        <div className="stp-item-card__check" style={{position: 'static', margin: 0, padding: 0}}>
                           <StepDot num={null} status="done" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                invLoading ? <div style={{padding: 20}}>Đang tải dữ liệu...</div> : 
                itemsInRooms.filter(i => !search1 || i.itemName?.toLowerCase().includes(search1.toLowerCase()) || i.itemCode?.toLowerCase().includes(search1.toLowerCase())).map(item => {
                  const uid = item.itemId || item.itemCode;
                  const isActive = selectedItemForByItem === uid;
                  const selectedRoomsCount = Object.keys(itemRoomsData[uid] || {}).length;
                  return (
                    <button key={uid} className={`stp-room-item ${isActive ? "stp-room-item--selected" : ""}`} onClick={() => setSelectedItemForByItem(uid)}>
                      <ScienceOutlined style={{ fontSize: 18 }} />
                      <div className="stp-room-item__info">
                        <span className="stp-room-item__name">{item.itemName}</span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Có tại {rooms.filter(r => (inventories[r.roomId] || []).some(inv => (inv.itemId === uid || inv.itemCode === uid) && inv.availableQuantity > 0)).length} phòng</span>
                      </div>
                      {selectedRoomsCount > 0 && (
                        <div className="stp-item-card__check" style={{position: 'static', margin: 0, padding: 0}}>
                           <StepDot num={null} status="done" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COL 2 */}
        <div className="stp-col" style={{ gridColumn: "2" }}>
          <div className={`stp-card ${subMode === "byRoom" ? (selectedRoomsForByRoom.length === 0 ? "stp-card--dim" : "") : (!selectedItemForByItem ? "stp-card--dim" : "")}`}>
            <div className="stp-card__header">
              <StepDot num={2} status={(subMode === "byRoom" ? summaryData.length > 0 : Object.keys(itemRoomsData).length > 0) ? "done" : "active"} />
              <div className="stp-card__title">
                {subMode === "byRoom" ? "Chọn hóa chất cần thu hồi" : "Chọn phòng thu hồi"}
              </div>
            </div>

            <div className="stp-search-row">
              <SearchOutlined style={{ fontSize: 16, color: "var(--stp-muted)" }} />
              <input
                className="stp-input"
                placeholder={subMode === "byRoom" ? "Tìm hóa chất trong phòng..." : "Tìm phòng..."}
                value={search2}
                onChange={(e) => setSearch2(filterSearchInput(e.target.value))}
              />
            </div>

            <div className="stp-room-sections" style={{ flex: 1, overflowY: 'auto' }}>
              {subMode === "byRoom" ? (
                selectedRoomsForByRoom.map(roomId => {
                  const room = rooms.find(r => r.roomId === roomId);
                  const roomInv = inventories[roomId] || [];
                  const filteredInv = roomInv.filter(i => (!search2 || i.itemName?.toLowerCase().includes(search2.toLowerCase())) && i.availableQuantity > 0);
                  
                  return (
                    <RoomItemSectionRevoke
                      key={roomId}
                      room={room}
                      items={filteredInv}
                      roomItemsData={roomItemsData}
                      onToggleItem={toggleItemInByRoom}
                      onChangeCount={setCountInByRoom}
                      onRemoveRoom={toggleRoomInByRoom}
                      globalItems={globalItems}
                    />
                  );
                })
              ) : (
                selectedItemForByItem && (() => {
                  const roomsWithItem = rooms.filter(r => {
                    const inv = inventories[r.roomId] || [];
                    return inv.some(i => (i.itemId === selectedItemForByItem || i.itemCode === selectedItemForByItem) && i.availableQuantity > 0);
                  });
                  
                  const filteredRooms = roomsWithItem.filter(r => !search2 || r.roomName.toLowerCase().includes(search2.toLowerCase()));
                  const globalItem = globalItems.find(g => g.itemId === selectedItemForByItem || g.itemCode === selectedItemForByItem);

                  if (filteredRooms.length === 0) return <div style={{padding: 20}}>Không có phòng nào chứa hóa chất này.</div>;

                  return (
                    <div className="stp-item-grid stp-item-grid--compact">
                      {filteredRooms.map(room => {
                        const invItem = (inventories[room.roomId] || []).find(i => i.itemId === selectedItemForByItem || i.itemCode === selectedItemForByItem);
                        const sel = (itemRoomsData[selectedItemForByItem] || {})[room.roomId] !== undefined;
                        const packageCount = (itemRoomsData[selectedItemForByItem] || {})[room.roomId];
                        const maxPkgs = getMaxPackages(invItem.availableQuantity, globalItem?.amountPerPackage);
                        let error = sel ? validatePackageCount(packageCount) : false;
                        if (!error && sel) {
                          if (packageCount > maxPkgs) error = "Vượt tồn";
                        }

                        return (
                          <ItemCardBase
                            key={room.roomId}
                            selected={sel}
                            error={error}
                            onToggle={() => toggleRoomInByItem(room.roomId)}
                            packageCount={packageCount}
                            onChangeCount={(val) => setCountInByItem(room.roomId, val)}
                            maxPackages={maxPkgs}
                          >
                            <div className="stp-item-card__name">{room.roomName}</div>
                            <div className="stp-item-card__code">
                              <DomainOutlined style={{ fontSize: 14, marginRight: 4, verticalAlign: 'middle' }} />
                              Phòng Thí Nghiệm
                            </div>
                            <div className="stp-item-card__meta" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {globalItem?.formula && (
                                <span className="stp-item-card__cat" style={{ alignSelf: 'flex-start' }}>{globalItem.formula}</span>
                              )}
                              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span>Tổng: {invItem.totalQuantity !== undefined ? invItem.totalQuantity : "?"}</span>
                                <span>Khóa: {invItem.lockedQuantity !== undefined ? invItem.lockedQuantity : "?"}</span>
                                <span style={{ color: '#059669', fontWeight: 600 }}>Khả dụng: {invItem.availableQuantity} {globalItem?.unit || invItem.unit || "gói"}</span>
                              </div>
                              {globalItem?.amountPerPackage && (
                                <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 500 }}>
                                  Quy cách: {globalItem.amountPerPackage} {globalItem.unit || invItem.unit} / {globalItem.packaging || "gói"}
                                </div>
                              )}
                            </div>
                          </ItemCardBase>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>

        {/* COL 3 */}
        <div className="stp-col" style={{ gridColumn: "3" }}>
          <div className={`stp-card stp-card--full-height stp-confirm-card ${summaryData.length === 0 ? "stp-card--dim" : ""}`}>
            <div className="stp-card__header">
              <StepDot num={3} status={canConfirm ? "active" : "idle"} />
              <div className="stp-card__title">Xác nhận Thu hồi</div>
            </div>

            <div className="stp-summary">
               {summaryData.length > 0 && (
                 <div className="stp-summary__items stp-summary__items--expanded">
                   {summaryData.map((d) => (
                     <div key={d.roomId} className="stp-summary__room-block">
                       <div className="stp-summary__room-label">
                         <DomainOutlined style={{ fontSize: 12, color: "#059669" }} /> {d.roomName}
                       </div>
                       {d.items.map((i) => (
                         <div key={i.itemId} className={`stp-summary__chip stp-summary__chip--lg ${i.error ? "stp-summary__chip--err" : ""}`}>
                           <span className="stp-summary__chip-name">{i.itemName}</span>
                           {i.error ? (
                             <span style={{ color: "#dc2626", fontSize: 11 }}>{i.error}</span>
                           ) : (
                             <span className="stp-summary__chip-qty">{i.count} {i.packaging}</span>
                           )}
                         </div>
                       ))}
                     </div>
                   ))}
                 </div>
               )}
            </div>

            <div className="stp-note-row">
              <StickyNote2Outlined style={{ fontSize: 15, color: "var(--stp-muted)" }} />
              <input className="stp-input" placeholder="Ghi chú..." value={note} onChange={(e) => setNote(sanitizeNote(e.target.value))} maxLength={255} />
            </div>

            <button className="stp-confirm-btn stp-confirm-btn--revoke" disabled={!canConfirm} onClick={() => setConfirmOpen(true)}>
              {submitting ? "Đang xử lý..." : "Xác nhận thu hồi"}
            </button>
          </div>
        </div>
      </div>

      <SupplyConfirmDialog
        type="revoke"
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFinalConfirm}
        submitting={submitting}
        summaryData={summaryData}
        note={note}
      />
    </div>
  );
}
