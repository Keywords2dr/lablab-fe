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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChemicalBorrowPage() {
  const navigate = useNavigate();

  // ── Room list state ────────────────────────────────────────────────────────
  const [rooms, setRooms]               = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomSearch, setRoomSearch]     = useState("");
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const PAGE_SIZE = 10;
  const abortRoomsRef = useRef(null);

  // ── Selection / form state ─────────────────────────────────────────────────
  const [selectedRoom, setSelectedRoom]         = useState(null);
  const [selectedChemicals, setSelectedChemicals] = useState({});

  const [form, setForm]     = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const [step, setStep]               = useState(1);
  const [submitting, setSubmitting]   = useState(false);
  const [submitDone, setSubmitDone]   = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ── Fetch rooms ────────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    if (abortRoomsRef.current) abortRoomsRef.current.abort();
    const ctrl = new AbortController();
    abortRoomsRef.current = ctrl;

    setLoadingRooms(true);
    try {
      const res = await roomApi.getRooms(
        { keyword: roomSearch.trim(), status: "active", page, size: PAGE_SIZE },
        ctrl.signal
      );

      const rawData  = res.data?.content ?? res.data ?? [];
      const rawRooms = Array.isArray(rawData) ? rawData : [];
      setTotalPages(res.data?.totalPages ?? 0);

      const enriched = await Promise.all(
        rawRooms.map(async (room) => {
          const rId = room.id ?? room._id ?? room.roomId;
          if (!rId) return room;
          try {
            const staffRes  = await roomApi.getRoomStaff(rId);
            const staffList = staffRes.data ?? [];
            const managerName =
              staffList.length > 0
                ? staffList.map((s) => s.fullName ?? s.name ?? s.username).join(", ")
                : null;
            return { ...room, id: rId, managerName };
          } catch {
            return { ...room, id: rId, managerName: null };
          }
        })
      );

      setRooms(enriched);
    } catch (err) {
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        setRooms([]);
      }
    } finally {
      setLoadingRooms(false);
    }
  }, [roomSearch, page]);

  useEffect(() => {
    const t = setTimeout(fetchRooms, 350);
    return () => clearTimeout(t);
  }, [fetchRooms]);

  useEffect(() => {
    setPage(0);
  }, [roomSearch]);

  // ── Validation step 2 ──────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.purposeType)        e.purposeType        = "Vui lòng chọn mục đích.";
    if (!form.subjectName.trim()) e.subjectName        = "Vui lòng nhập tên môn học.";
    if (!form.classCode.trim())   e.classCode          = "Vui lòng nhập mã lớp.";
    if (!form.borrowDate)         e.borrowDate         = "Vui lòng chọn ngày giờ mượn.";
    if (!form.expectedReturnDate) e.expectedReturnDate = "Vui lòng chọn ngày giờ trả.";
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
    if (step === 1) return !!selectedRoom && Object.keys(selectedChemicals).length > 0;
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
      const chemicalItems = Object.values(selectedChemicals).map(({ chemical, quantity }) => ({
        itemId:           chemical.id, 
        quantityBorrowed: parseFloat(quantity) || 1,
      }));

      if (chemicalItems.length === 0) {
        setSubmitError("Vui lòng chọn ít nhất 1 hóa chất.");
        setSubmitting(false);
        return;
      }

      const payload = {
        roomId:               selectedRoom.id,
        ticketType:           "CHEMICAL_ONLY",
        purposeType:          form.purposeType,
        subjectName:          form.subjectName.trim(),
        classCode:            form.classCode.trim(),
        lessonDetail:         form.lessonDetail.trim() || undefined,
        borrowDate:           toISOString(form.borrowDate),
        expectedReturnDate:   toISOString(form.expectedReturnDate),
        note:                 form.note.trim() || undefined,
        items:                chemicalItems,
      };

      // Đã xoá dòng console.log ở đây

      await rentTicketApi.createTicket(payload);
      setSubmitDone(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Gửi yêu cầu thất bại. Vui lòng thử lại.";
      setSubmitError(msg);
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
      <div className="rr-root">
        <div className="rr-card">
          <div className="rr-success">
            <div className="rr-success-icon"><CheckCircleOutlined /></div>
            <div className="rr-success-title">Đăng ký thành công!</div>
            <div className="rr-success-sub">
              Yêu cầu mượn hóa chất tại{" "}
              <strong>{selectedRoom?.name ?? selectedRoom?.roomName}</strong>{" "}
              đã được gửi. Vui lòng chờ xác nhận.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
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

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
    <div className="rr-root">
      {/* Header */}
      <div className="rr-header">
        <div className="rr-header-left">
          <div className="rr-header-icon"><ScienceOutlined /></div>
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
          const num      = i + 1;
          const isDone   = step > num;
          const isActive = step === num;
          return (
            <React.Fragment key={num}>
              {i > 0 && (
                <div className={`rr-step-connector${isDone ? " done" : ""}`} />
              )}
              <div className={`rr-step${isActive ? " active" : ""}${isDone ? " done" : ""}`}>
                <div className="rr-step-circle">
                  {isDone ? <CheckCircleOutlined style={{ fontSize: 18 }} /> : num}
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
          setSelectedRoom={setSelectedRoom}
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
            <div style={{
              backgroundColor: "#fef2f2", color: "#dc2626",
              padding: "12px 16px", borderRadius: "10px", marginBottom: "20px",
              border: "1px solid #fee2e2", fontSize: "0.88rem",
              display: "flex", alignItems: "center", gap: 8,
            }}>
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
              {submitting ? "Đang xử lý..." : <><SendOutlined /> Gửi yêu cầu</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}