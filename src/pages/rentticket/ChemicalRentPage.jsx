import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScienceOutlined,
  ArrowForwardOutlined,
  ArrowBackOutlined,
  SendOutlined,
  CheckCircleOutlined,
  AddCircleOutlineOutlined,
  ReportProblemOutlined,
  HomeOutlined,
  CheckRounded,
  CloseRounded,
  ErrorOutlineOutlined,
} from "@mui/icons-material";

import StepRoomAndChemicals from "./components/StepRoomAndChemicals";
import StepChemBookingDetails from "./components/StepChemBookingDetails";
import StepChemReview from "./components/StepChemReview";
import { roomApi } from "../../api/roomApi";
import { rentTicketApi } from "../../api/rentTicketApi";

import "./styles/stepRoomAndChemicals.css";
import "./styles/stepChemReview.css";

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Chọn phòng & hóa chất" },
  { label: "Thông tin đặt" },
  { label: "Xác nhận" },
];

const INITIAL_FORM = {
  purposeType: "TEACHING",
  subjectName: "",
  classCode: "",
  lessonDetail: "",
  borrowDate: "",
  expectedReturnDate: "",
  note: "",
};

function toISOString(datetimeLocalValue) {
  if (!datetimeLocalValue) return null;
  return datetimeLocalValue.length === 16
    ? `${datetimeLocalValue}:00`
    : datetimeLocalValue;
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 380,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            pointerEvents: "all",
            cursor: "pointer",
            animation: "toast-in 0.3s ease",
            backgroundColor:
              t.type === "success"
                ? "#f0fdf4"
                : t.type === "error"
                  ? "#fef2f2"
                  : "#f0f9ff",
            borderLeft: `4px solid ${
              t.type === "success"
                ? "#16a34a"
                : t.type === "error"
                  ? "#dc2626"
                  : "#0284c7"
            }`,
          }}
          onClick={() => removeToast(t.id)}
        >
          <div
            style={{
              flexShrink: 0,
              width: 22,
              height: 22,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                t.type === "success"
                  ? "#16a34a"
                  : t.type === "error"
                    ? "#dc2626"
                    : "#0284c7",
              color: "#fff",
              marginTop: 1,
            }}
          >
            {t.type === "success" ? (
              <CheckRounded style={{ fontSize: 14 }} />
            ) : t.type === "error" ? (
              <CloseRounded style={{ fontSize: 14 }} />
            ) : (
              <ErrorOutlineOutlined style={{ fontSize: 14 }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.875rem",
                color:
                  t.type === "success"
                    ? "#15803d"
                    : t.type === "error"
                      ? "#b91c1c"
                      : "#0369a1",
                marginBottom: 2,
              }}
            >
              {t.title}
            </div>
            {t.message && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  lineHeight: 1.45,
                }}
              >
                {t.message}
              </div>
            )}
          </div>
          <CloseRounded
            style={{
              fontSize: 16,
              color: "#94a3b8",
              flexShrink: 0,
              marginTop: 2,
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ─── useToast hook ─────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback(
    ({ type = "info", title, message, duration = 4000 }) => {
      const id = ++counterRef.current;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    [],
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChemicalBorrowPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  // ── Room list state ────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;
  const abortRoomsRef = useRef(null);
  const abortStaffRef = useRef(null);

  // ── Selection / form state ─────────────────────────────────────────────────
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedChemicals, setSelectedChemicals] = useState({});

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchRooms = useCallback(async () => {
    if (abortRoomsRef.current) abortRoomsRef.current.abort();
    if (abortStaffRef.current) abortStaffRef.current.abort();
    const ctrl = new AbortController();
    abortRoomsRef.current = ctrl;

    setLoadingRooms(true);
    try {
      const res = await roomApi.getRooms(
        { keyword: roomSearch.trim(), status: "active", page, size: PAGE_SIZE },
        ctrl.signal,
      );

      if (ctrl.signal.aborted) return;

      const rawData = res.data?.content ?? res.data ?? [];
      const rawRooms = Array.isArray(rawData) ? rawData : [];
      setTotalPages(res.data?.totalPages ?? 0);

      const mapped = rawRooms.map((room) => ({
        ...room,
        id: room.id ?? room._id ?? room.roomId,
        managerName: null,
      }));
      setRooms(mapped);
      setLoadingRooms(false);

      if (mapped.length === 0) return;
      const staffCtrl = new AbortController();
      abortStaffRef.current = staffCtrl;

      for (const room of mapped) {
        if (staffCtrl.signal.aborted) break;
        try {
          const staffRes = await roomApi.getRoomStaff(room.id);
          if (staffCtrl.signal.aborted) break;
          const staffList = staffRes.data ?? [];
          const managerName =
            staffList.length > 0
              ? staffList
                  .map((s) => s.fullName ?? s.name ?? s.username)
                  .join(", ")
              : "";
          setRooms((prev) =>
            prev.map((r) => (r.id === room.id ? { ...r, managerName } : r)),
          );
          setSelectedRoom((prev) =>
            prev?.id === room.id ? { ...prev, managerName } : prev,
          );
        } catch {
          // bỏ qua lỗi cho từng phòng, tiếp tục phòng kế
        }
      }
    } catch (err) {
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        setRooms([]);
        setLoadingRooms(false);
      }
    }
  }, [roomSearch, page]);

  useEffect(() => {
    const t = setTimeout(fetchRooms, 300);
    return () => clearTimeout(t);
  }, [fetchRooms]);

  useEffect(() => {
    setPage(0);
  }, [roomSearch]);

  const handleSelectRoom = useCallback((room) => {
    setSelectedRoom(room);
    setSelectedChemicals({});
  }, []);

  // ── Validation step 2 ──────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.purposeType) e.purposeType = "Vui lòng chọn mục đích.";
    if (!form.subjectName.trim()) e.subjectName = "Vui lòng nhập tên môn học.";
    if (!form.classCode.trim()) e.classCode = "Vui lòng nhập mã lớp.";
    if (!form.borrowDate) e.borrowDate = "Vui lòng chọn ngày giờ mượn.";
    if (!form.expectedReturnDate)
      e.expectedReturnDate = "Vui lòng chọn ngày giờ trả.";
    if (
      form.borrowDate &&
      form.expectedReturnDate &&
      form.expectedReturnDate <= form.borrowDate
    ) {
      e.expectedReturnDate = "Thời gian trả dự kiến phải sau thời gian mượn.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canGoNext = () => {
    if (step === 1)
      return !!selectedRoom && Object.keys(selectedChemicals).length > 0;
    if (step === 2) return true;
    return false;
  };

  const goNext = () => {
    if (step === 2 && !validate()) return;
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setSubmitError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const chemicalItems = Object.values(selectedChemicals).map(
        ({ chemical, quantity }) => ({
          itemId: chemical.id,
          quantityBorrowed: parseFloat(quantity) || 1,
        }),
      );

      if (chemicalItems.length === 0) {
        const msg = "Vui lòng chọn ít nhất 1 hóa chất.";
        setSubmitError(msg);
        addToast({ type: "error", title: "Thiếu thông tin", message: msg });
        setSubmitting(false);
        return;
      }

      const payload = {
        roomId: selectedRoom.id,
        ticketType: "CHEMICAL_ONLY",
        purposeType: form.purposeType,
        subjectName: form.subjectName.trim(),
        classCode: form.classCode.trim(),
        lessonDetail: form.lessonDetail.trim() || undefined,
        borrowDate: toISOString(form.borrowDate),
        expectedReturnDate: toISOString(form.expectedReturnDate),
        note: form.note.trim() || undefined,
        items: chemicalItems,
      };

      await rentTicketApi.createTicket(payload);

      addToast({
        type: "success",
        title: "Gửi yêu cầu thành công!",
        message: `Phiếu mượn hóa chất tại ${selectedRoom?.name ?? selectedRoom?.roomName} đã được tạo. Vui lòng chờ xác nhận.`,
        duration: 6000,
      });

      setSubmitDone(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Gửi yêu cầu thất bại. Vui lòng thử lại.";
      setSubmitError(msg);
      addToast({
        type: "error",
        title: "Gửi yêu cầu thất bại",
        message: msg,
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedRoom(null);
    setSelectedChemicals({});
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitDone(false);
    setSubmitError(null);
    setRoomSearch("");
    setPage(0);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitDone) {
    return (
      <>
        <Toast toasts={toasts} removeToast={removeToast} />
        <div className="rr-root">
          <div className="rr-card">
            <div className="rr-success">
              <div className="rr-success-icon">
                <CheckCircleOutlined />
              </div>
              <div className="rr-success-title">Đăng ký thành công!</div>
              <div className="rr-success-sub">
                Yêu cầu mượn hóa chất tại{" "}
                <strong>{selectedRoom?.name ?? selectedRoom?.roomName}</strong>{" "}
                đã được gửi. Vui lòng chờ xác nhận.
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button className="rr-btn rr-btn-primary" onClick={reset}>
                  <AddCircleOutlineOutlined /> Tạo phiếu mới
                </button>
                <button
                  className="rr-btn rr-btn-ghost"
                  onClick={() => navigate("/")}
                >
                  <HomeOutlined /> Về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="rr-root">
        {/* Header */}
        <div className="rr-header">
          <div className="rr-header-left">
            <div className="rr-header-icon">
              <ScienceOutlined />
            </div>
            <div>
              <div className="rr-header-title">Đăng ký mượn hóa chất</div>
              <div className="rr-header-sub">
                Chọn phòng và hóa chất, sau đó điền thông tin để gửi yêu cầu.
              </div>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="rr-stepper">
          {STEPS.map((s, i) => {
            const num = i + 1;
            const isDone = step > num;
            const isActive = step === num;
            return (
              <React.Fragment key={num}>
                {i > 0 && (
                  <div
                    className={`rr-step-connector${isDone ? " done" : ""}`}
                  />
                )}
                <div
                  className={`rr-step${isActive ? " active" : ""}${isDone ? " done" : ""}`}
                >
                  <div className="rr-step-circle">
                    {isDone ? (
                      <CheckCircleOutlined style={{ fontSize: 18 }} />
                    ) : (
                      num
                    )}
                  </div>
                  <span className="rr-step-label">{s.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Step content */}
        {step === 1 && (
          <StepRoomAndChemicals
            rooms={rooms}
            loading={loadingRooms}
            roomSearch={roomSearch}
            setRoomSearch={setRoomSearch}
            selectedRoom={selectedRoom}
            setSelectedRoom={handleSelectRoom}
            selectedChemicals={selectedChemicals}
            setSelectedChemicals={setSelectedChemicals}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        )}

        {step === 2 && (
          <StepChemBookingDetails
            selectedRoom={selectedRoom}
            selectedChemicals={selectedChemicals}
            form={form}
            setField={setField}
            errors={errors}
          />
        )}

        {step === 3 && (
          <>
            {submitError && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  border: "1px solid #fee2e2",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ReportProblemOutlined fontSize="small" /> {submitError}
              </div>
            )}
            <StepChemReview
              selectedRoom={selectedRoom}
              selectedChemicals={selectedChemicals}
              form={form}
            />
          </>
        )}

        {/* Actions */}
        <div className="rr-actions">
          <div>
            {step > 1 && (
              <button className="rr-btn rr-btn-ghost" onClick={goBack}>
                <ArrowBackOutlined /> Quay lại
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {step === 1 && !canGoNext() && (
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                {!selectedRoom
                  ? "Chọn phòng và ít nhất 1 hóa chất"
                  : "Chọn ít nhất 1 hóa chất"}
              </span>
            )}
            {step < 3 ? (
              <button
                className="rr-btn rr-btn-primary"
                onClick={goNext}
                disabled={!canGoNext()}
              >
                Tiếp theo <ArrowForwardOutlined />
              </button>
            ) : (
              <button
                className="rr-btn rr-btn-success"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <SendOutlined /> Gửi yêu cầu
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
