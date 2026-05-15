import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MeetingRoomOutlined, ArrowForwardOutlined, ArrowBackOutlined, SendOutlined,
  CheckCircleOutlined, AddCircleOutlineOutlined, MeetingRoomTwoTone, ReportProblemOutlined,
  HomeOutlined,
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

export default function RoomRentPage() {
  const navigate = useNavigate();

  const {
    rooms, loadingRooms, roomSearch, setRoomSearch,
    selectedRoom, setSelectedRoom,
    step, goNext, goBack,
    form, setField, errors,
    submitting, submitDone, submitError, handleSubmit, reset,
    page, setPage, totalPages
  } = useRoomRent();

  if (submitDone) {
    return (
      <div className="rr-root">
        <div className="rr-card">
          <div className="rr-success">
            <div className="rr-success-icon"><CheckCircleOutlined /></div>
            <div className="rr-success-title">Đăng ký thành công!</div>
            <div className="rr-success-sub">
              Yêu cầu mượn <strong>{selectedRoom?.name || selectedRoom?.roomName}</strong> đã được gửi. Vui lòng chờ xác nhận.
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="rr-btn rr-btn-primary" onClick={reset}>
                <AddCircleOutlineOutlined /> Tạo phiếu mới
              </button>
              <button className="rr-btn rr-btn-ghost" onClick={() => navigate("/")}>
                <HomeOutlined /> Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rr-root">
      <div className="rr-header">
        <div className="rr-header-left">
          <div className="rr-header-icon"><MeetingRoomTwoTone /></div>
          <div>
            <div className="rr-header-title">Đăng ký mượn phòng Lab</div>
            <div className="rr-header-sub">Chọn phòng và điền thông tin để gửi yêu cầu.</div>
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
              {i > 0 && <div className={`rr-step-connector${isDone ? " done" : ""}`} />}
              <div className={`rr-step${isActive ? " active" : ""}${isDone ? " done" : ""}`}>
                <div className="rr-step-circle">{isDone ? <CheckCircleOutlined style={{ fontSize: 18 }} /> : num}</div>
                <span className="rr-step-label">{s.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {step === 1 && (
        <StepSelectRoom
          rooms={rooms} loading={loadingRooms} roomSearch={roomSearch} setRoomSearch={setRoomSearch}
          selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom}
          page={page} setPage={setPage} totalPages={totalPages}
        />
      )}

      {step === 2 && (
        <StepBookingDetails selectedRoom={selectedRoom} form={form} setField={setField} errors={errors} />
      )}

      {step === 3 && (
        <>
          {submitError && (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #fee2e2', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ReportProblemOutlined fontSize="small" /> {submitError}
            </div>
          )}
          <StepReview selectedRoom={selectedRoom} form={form} />
        </>
      )}

      <div className="rr-actions">
        <div>
          {step > 1 && <button className="rr-btn rr-btn-ghost" onClick={goBack}><ArrowBackOutlined /> Quay lại</button>}
        </div>
        <div>
          {step < 3 ? (
            <button className="rr-btn rr-btn-primary" onClick={goNext} disabled={step === 1 && !selectedRoom}>
              Tiếp theo <ArrowForwardOutlined />
            </button>
          ) : (
            <button className="rr-btn rr-btn-success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Đang xử lý..." : <><SendOutlined /> Gửi yêu cầu</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}