import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MeetingRoomOutlined,
  ArrowForwardOutlined,
  ArrowBackOutlined,
  SendOutlined,
  CheckCircleOutlined,
  AddCircleOutlineOutlined,
  MeetingRoomTwoTone,
  ReportProblemOutlined,
  HomeOutlined,
  CheckRounded,
  CloseRounded,
  ErrorOutlineOutlined,
} from "@mui/icons-material";

import { useRoomRent } from "./hooks/useRoomRent";
import StepSelectRoom from "./components/StepSelectRoom";
import StepBookingDetails from "./components/StepBookingDetails";
import StepReview from "./components/StepReview";
import "./styles/roomRent.css";

const STEPS = [
  { label: "Chọn phòng" },
  { label: "Thông tin đặt" },
  { label: "Xác nhận" },
];

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
                marginBottom: 2,
                color:
                  t.type === "success"
                    ? "#15803d"
                    : t.type === "error"
                      ? "#b91c1c"
                      : "#0369a1",
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
        setTimeout(
          () => setToasts((prev) => prev.filter((t) => t.id !== id)),
          duration,
        );
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
export default function RoomRentPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const {
    rooms,
    loadingRooms,
    roomSearch,
    setRoomSearch,
    selectedRoom,
    setSelectedRoom,
    step,
    goNext,
    goBack,
    form,
    setField,
    errors,
    submitting,
    submitDone,
    submitError,
    handleSubmit,
    reset,
    page,
    setPage,
    totalPages,
  } = useRoomRent();

  const handleSubmitWithToast = async () => {
    const result = await handleSubmit();
    if (result?.success) {
      addToast({
        type: "success",
        title: "Gửi yêu cầu thành công!",
        message: `Phiếu mượn phòng ${selectedRoom?.name ?? selectedRoom?.roomName} đã được tạo. Vui lòng chờ xác nhận.`,
        duration: 6000,
      });
    } else if (result?.success === false) {
      addToast({
        type: "error",
        title: "Gửi yêu cầu thất bại",
        message: result.message,
        duration: 6000,
      });
    }
  };

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
                Yêu cầu mượn{" "}
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

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="rr-root">
        <div className="rr-header">
          <div className="rr-header-left">
            <div className="rr-header-icon">
              <MeetingRoomTwoTone />
            </div>
            <div>
              <div className="rr-header-title">Đăng ký mượn phòng Lab</div>
              <div className="rr-header-sub">
                Chọn phòng và điền thông tin để gửi yêu cầu.
              </div>
            </div>
          </div>
        </div>

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

        {step === 1 && (
          <StepSelectRoom
            rooms={rooms}
            loading={loadingRooms}
            roomSearch={roomSearch}
            setRoomSearch={setRoomSearch}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        )}

        {step === 2 && (
          <StepBookingDetails
            selectedRoom={selectedRoom}
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
            <StepReview selectedRoom={selectedRoom} form={form} />
          </>
        )}

        <div className="rr-actions">
          <div>
            {step > 1 && (
              <button className="rr-btn rr-btn-ghost" onClick={goBack}>
                <ArrowBackOutlined /> Quay lại
              </button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <button
                className="rr-btn rr-btn-primary"
                onClick={goNext}
                disabled={step === 1 && !selectedRoom}
              >
                Tiếp theo <ArrowForwardOutlined />
              </button>
            ) : (
              <button
                className="rr-btn rr-btn-success"
                onClick={handleSubmitWithToast}
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
