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
  const abortRef = useRef(null);

  const fetchRooms = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoadingRooms(true);
    try {
      const res = await roomApi.getRooms(
        { keyword: roomSearch.trim(), status: "active", page, size: pageSize },
        ctrl.signal
      );

      const rawData = res.data?.content || res.data || [];
      const rawRooms = Array.isArray(rawData) ? rawData : [];
      setTotalPages(res.data?.totalPages || 0);

      const enrichedRooms = await Promise.all(
        rawRooms.map(async (room) => {
          const rId = room.id || room._id || room.roomId;
          if (!rId) return room;
          try {
            const staffRes = await roomApi.getRoomStaff(rId);
            const staffList = staffRes.data || [];
            const managerName =
              staffList.length > 0
                ? staffList.map((s) => s.fullName || s.name || s.username).join(", ")
                : null;
            return { ...room, id: rId, managerName };
          } catch {
            return { ...room, id: rId, managerName: null };
          }
        })
      );

      setRooms(enrichedRooms);
    } catch (err) {
      if (err?.name !== "CanceledError") setRooms([]);
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
    
    if (form.borrowDate && form.expectedReturnDate && form.expectedReturnDate <= form.borrowDate) {
      e.expectedReturnDate = "Thời gian trả dự kiến phải sau thời gian mượn.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 1 && selectedRoom) setStep(2);
    else if (step === 2 && validate()) setStep(3);
  };
  
  const goBack = () => { setSubmitError(null); setStep((s) => s - 1); };

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
    } catch (err) {
      console.error("Submit failed:", err);
      const msg = err?.response?.data?.message || err?.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.";
      setSubmitError(msg);
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
    rooms, loadingRooms, roomSearch, setRoomSearch,
    selectedRoom, setSelectedRoom,
    step, goNext, goBack,
    form, setField, errors,
    submitting, submitDone, submitError, handleSubmit, reset,
    page, setPage, totalPages,
  };
}