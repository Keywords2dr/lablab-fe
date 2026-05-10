import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Search,
  Close,
  Send,
  Inventory,
  History,
  LocalShipping,
  CheckCircle,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { roomApi } from "../../../../api/roomApi";
import { chemicalApi } from "../../../../api/chemicalApi";

export default function SupplyTransferPanel({ rooms }) {
  const [selectedRoom, setSelectedRoom] = useState("");
  const [inventory, setInventory] = useState([]);
  const [chemicals, setChemicals] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingInv, setLoadingInv] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chemSearch, setChemSearch] = useState("");
  const isComposing = useRef(false);

  const [selectedChem, setSelectedChem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  // ── Derived values ─────────────────────────────────────────────────────
  const selectedRoomId = useMemo(
    () => (selectedRoom ? parseInt(selectedRoom, 10) : null),
    [selectedRoom],
  );
  const selectedRoomObj = useMemo(
    () => rooms.find((r) => r.roomId === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  // ── Fetch helpers ──────────────────────────────────────────────────────
  const loadRoomData = useCallback(async (roomId) => {
    setLoadingInv(true);
    try {
      const [invRes, histRes] = await Promise.all([
        roomApi.getRoomInventory(roomId),
        roomApi.getDistributionHistory(roomId),
      ]);
      setInventory(invRes.data ?? []);
      setHistory(histRes.data ?? []);
    } catch (err) {
      console.error("[SupplyTransferPanel] loadRoomData failed:", err);
      setInventory([]);
      setHistory([]);
    } finally {
      setLoadingInv(false);
    }
  }, []);

  // Load danh sách hóa chất một lần khi mount
  useEffect(() => {
    chemicalApi
      .getChemicals({ size: 200 })
      .then((res) => {
        const list = res.data?.content ?? res.data ?? [];
        setChemicals(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("[SupplyTransferPanel] getChemicals failed:", err);
        setChemicals([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedRoomId) {
      setInventory([]);
      setHistory([]);
      return;
    }
    loadRoomData(selectedRoomId);
  }, [selectedRoomId, loadRoomData]);

  // ── Filter chemicals ───────────────────────────────────────────────────
  const filteredChemicals = useMemo(() => {
    if (!chemSearch) return chemicals;
    const kw = chemSearch.toLowerCase();
    return chemicals.filter(
      (c) =>
        c.name?.toLowerCase().includes(kw) ||
        c.itemCode?.toLowerCase().includes(kw),
    );
  }, [chemicals, chemSearch]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setSelectedChem(null);
    setQuantity("");
    setNote("");
    setChemSearch("");
  }, []);

  const handleRoomChange = useCallback(
    (e) => {
      setSelectedRoom(e.target.value);
      resetForm();
    },
    [resetForm],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) return toast.warning("Vui lòng chọn phòng đích!");
    if (!selectedChem) return toast.warning("Vui lòng chọn hóa chất!");
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return toast.warning("Số lượng phải lớn hơn 0!");

    setSubmitting(true);
    try {
      await roomApi.distributeSupply({
        roomId: selectedRoomId,
        chemicalId: selectedChem.itemId,
        quantity: qty,
        note: note.trim(),
      });
      toast.success(
        ` Đã phân phối ${qty} ${selectedChem.unit} ${selectedChem.name}`,
      );

      await loadRoomData(selectedRoomId);
      resetForm();
    } catch (err) {
      toast.error(` ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="supply-root">
      {/* ── Room Selector ── */}
      <div className="supply-room-bar">
        <LocalShipping style={{ color: "#f59e0b" }} />
        <span className="supply-room-label">Phòng nhận vật tư:</span>
        <select
          className="supply-room-select"
          value={selectedRoom}
          onChange={handleRoomChange}
        >
          <option value="">— Chọn phòng —</option>
          {rooms.map((r) => (
            <option key={r.roomId} value={r.roomId}>
              {r.roomCode} — {r.roomName}
            </option>
          ))}
        </select>
        {selectedRoomObj && (
          <span className="supply-room-badge">
            {selectedRoomObj.building} · Tầng {selectedRoomObj.floor}
          </span>
        )}
      </div>

      <div className="supply-body">
        {/* ── LEFT: Inventory + Form ── */}
        <div className="supply-left">
          {/* Inventory */}
          <div className="supply-card">
            <div className="supply-card-title">
              <Inventory fontSize="small" style={{ color: "#6366f1" }} />
              Tồn kho hiện tại{" "}
              {selectedRoomObj ? `— ${selectedRoomObj.roomCode}` : ""}
            </div>

            {!selectedRoomId ? (
              <p className="supply-hint">Chọn phòng để xem tồn kho</p>
            ) : loadingInv ? (
              <p className="supply-hint">Đang tải...</p>
            ) : inventory.length === 0 ? (
              <p className="supply-hint">Phòng chưa có vật tư nào</p>
            ) : (
              <div className="supply-inv-table-wrap">
                <table className="rm-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Tên hóa chất</th>
                      <th className="right">Số lượng</th>
                      <th className="center">Đơn vị</th>
                      <th className="center">Cập nhật</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.chemicalId}>
                        <td>
                          <span
                            className="rm-code"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {item.itemCode ?? `#${item.chemicalId}`}
                          </span>
                        </td>
                        <td>
                          <span className="rm-name">{item.name ?? "—"}</span>
                        </td>
                        <td
                          className="right"
                          style={{ fontWeight: 700, color: "#1e293b" }}
                        >
                          {item.quantity}
                        </td>
                        <td className="center" style={{ color: "#64748b" }}>
                          {item.unit ?? "—"}
                        </td>
                        <td
                          className="center"
                          style={{ fontSize: "0.78rem", color: "#94a3b8" }}
                        >
                          {item.updatedAt ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Distribution Form */}
          <div className="supply-card">
            <div className="supply-card-title">
              <Send fontSize="small" style={{ color: "#f59e0b" }} />
              Phân phối vật tư mới
            </div>

            <form onSubmit={handleSubmit}>
              {/* Chemical Search */}
              <div className="rm-form-row" style={{ marginBottom: 12 }}>
                <label className="rm-form-label">
                  Hóa chất / Vật tư <span className="required">*</span>
                </label>

                {selectedChem ? (
                  <div className="supply-selected-chem">
                    <CheckCircle style={{ color: "#10b981", fontSize: 18 }} />
                    <span>
                      <strong>{selectedChem.itemCode}</strong> —{" "}
                      {selectedChem.name}
                    </span>
                    <button
                      type="button"
                      className="rm-search-clear"
                      style={{ position: "static", marginLeft: "auto" }}
                      onClick={() => {
                        setSelectedChem(null);
                        setChemSearch("");
                      }}
                    >
                      <Close />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rm-search-wrap" style={{ marginBottom: 8 }}>
                      <Search className="rm-search-icon" />
                      <input
                        placeholder="Tìm mã, tên hóa chất..."
                        value={chemSearch}
                        onCompositionStart={() => {
                          isComposing.current = true;
                        }}
                        onCompositionEnd={(e) => {
                          isComposing.current = false;
                          setChemSearch(e.target.value);
                        }}
                        onChange={(e) => setChemSearch(e.target.value)}
                      />
                      {chemSearch && (
                        <button
                          type="button"
                          className="rm-search-clear"
                          onClick={() => setChemSearch("")}
                        >
                          <Close />
                        </button>
                      )}
                    </div>

                    {chemSearch && (
                      <div className="supply-chem-dropdown">
                        {filteredChemicals.length === 0 ? (
                          <div
                            className="supply-chem-option"
                            style={{ color: "#94a3b8" }}
                          >
                            Không tìm thấy
                          </div>
                        ) : (
                          filteredChemicals.slice(0, 8).map((c) => (
                            <div
                              key={c.itemId}
                              className="supply-chem-option"
                              onClick={() => {
                                setSelectedChem(c);
                                setChemSearch("");
                              }}
                            >
                              <span
                                className="rm-code"
                                style={{ fontSize: "0.72rem" }}
                              >
                                {c.itemCode}
                              </span>
                              <span>{c.name}</span>
                              <span
                                style={{
                                  marginLeft: "auto",
                                  color: "#94a3b8",
                                  fontSize: "0.78rem",
                                }}
                              >
                                {c.unit}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="rm-form-grid">
                <div className="rm-form-row">
                  <label className="rm-form-label">
                    Số lượng {selectedChem ? `(${selectedChem.unit})` : ""}
                    <span className="required">*</span>
                  </label>
                  <input
                    className="rm-form-input"
                    type="number"
                    min="0.01"
                    step="any"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="rm-form-row">
                  <label className="rm-form-label">Ghi chú</label>
                  <input
                    className="rm-form-input"
                    placeholder="Lý do, đợt phân phối..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="supply-submit-btn"
                disabled={submitting || !selectedRoomId}
              >
                <Send style={{ fontSize: 18 }} />
                {submitting ? "Đang xử lý..." : "Phân phối vào phòng"}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: History ── */}
        <div className="supply-right">
          <div className="supply-card supply-history-card">
            <div className="supply-card-title">
              <History fontSize="small" style={{ color: "#8b5cf6" }} />
              Lịch sử phân phối{" "}
              {selectedRoomObj ? `— ${selectedRoomObj.roomCode}` : "gần đây"}
            </div>

            {history.length === 0 ? (
              <p className="supply-hint">Chưa có lịch sử phân phối</p>
            ) : (
              <div className="supply-inv-table-wrap">
                <table className="rm-table">
                  <thead>
                    <tr>
                      <th>Phòng</th>
                      <th>Hóa chất</th>
                      <th className="right">Số lượng</th>
                      <th>Ghi chú</th>
                      <th className="center">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td>
                          <span
                            className="rm-code"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {h.room ?? `#${h.roomId}`}
                          </span>
                        </td>
                        <td style={{ color: "#4f46e5", fontSize: "0.85rem" }}>
                          #{h.chemicalId}
                        </td>
                        <td className="right" style={{ fontWeight: 700 }}>
                          {h.quantity}
                        </td>
                        <td style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          {h.note || "—"}
                        </td>
                        <td
                          className="center"
                          style={{ fontSize: "0.78rem", color: "#94a3b8" }}
                        >
                          {h.createdAt
                            ? new Date(h.createdAt).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
