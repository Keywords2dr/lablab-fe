import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { roomApi } from "../../../api/roomApi";
import { rentTicketApi } from "../../../api/rentTicketApi";

function toISOString(datetimeLocalValue) {
  if (!datetimeLocalValue) return null;
  return datetimeLocalValue.length === 16
    ? `${datetimeLocalValue}:00`
    : datetimeLocalValue;
}

export function useRoomRent() {
  const location = useLocation();

  const isChemicalRoute = location.pathname.includes("/borrow/chemical");
  const autoTicketType = isChemicalRoute ? "CHEMICAL_ONLY" : "ROOM_ONLY";

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const abortRoomsRef = useRef(null);
  const abortStaffRef = useRef(null);

  // ── Fetch rooms fast (no staff), then load staff in background ─────────────
  const fetchRooms = useCallback(async () => {
    // Hủy cả 2 batch cũ
    if (abortRoomsRef.current) abortRoomsRef.current.abort();
    if (abortStaffRef.current) abortStaffRef.current.abort();

    const ctrl = new AbortController();
    abortRoomsRef.current = ctrl;

    setLoadingRooms(true);
    try {
      const res = await roomApi.getRooms(
        { keyword: roomSearch.trim(), status: "active", page, size: pageSize },
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
          // bỏ qua lỗi từng phòng, tiếp tục
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

  // ── Step / form state ──────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const INITIAL_FORM = {
    ticketType: autoTicketType,
    purposeType: "TEACHING",
    subjectName: "",
    classCode: "",
    lessonDetail: "",
    borrowDate: "",
    expectedReturnDate: "",
    note: "",
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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

  const goNext = () => {
    if (step === 1 && selectedRoom) setStep(2);
    else if (step === 2 && validate()) setStep(3);
  };

  const goBack = () => {
    setSubmitError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        roomId: selectedRoom?.id,
        ticketType: form.ticketType,
        purposeType: form.purposeType,
        subjectName: form.subjectName.trim(),
        classCode: form.classCode.trim(),
        lessonDetail: form.lessonDetail.trim() || undefined,
        borrowDate: toISOString(form.borrowDate),
        expectedReturnDate: toISOString(form.expectedReturnDate),
        note: form.note.trim() || undefined,
      };

      await rentTicketApi.createTicket(payload);
      setSubmitDone(true);
      return { success: true };
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Gửi yêu cầu thất bại. Vui lòng thử lại.";
      setSubmitError(msg);
      return { success: false, message: msg };
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedRoom(null);
    setSubmitDone(false);
    setSubmitError(null);
    setPage(0);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  return {
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
  };
}
