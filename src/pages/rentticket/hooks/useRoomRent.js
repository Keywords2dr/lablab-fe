import { useState, useEffect, useCallback, useRef } from "react";
import { roomApi } from "../../../api/roomApi";

export function useRoomRent() {
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
        { 
          keyword: roomSearch.trim(), 
          status: "active", 
          page: page, 
          size: pageSize 
        },
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
            const managerName = staffList.length > 0 
              ? staffList.map(s => s.fullName || s.name || s.username).join(", ") 
              : null;
            return { ...room, id: rId, managerName: managerName };
          } catch (err) {
            return { ...room, id: rId, managerName: null };
          }
        })
      );

      setRooms(enrichedRooms);
    } catch (err) {
      if (err?.name !== "CanceledError") {
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

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [form, setForm] = useState({ purpose: "", subject: "", classCode: "", borrowDate: "", expectedReturnDate: "" });
  const [errors, setErrors] = useState({});

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const goNext = () => step === 1 ? (selectedRoom && setStep(2)) : setStep(3);
  const goBack = () => setStep(s => s - 1);
  const handleSubmit = () => { setSubmitting(true); setTimeout(() => { setSubmitDone(true); setSubmitting(false); }, 1000); };
  const reset = () => { setStep(1); setSelectedRoom(null); setSubmitDone(false); setPage(0); };

  return { 
    rooms, loadingRooms, roomSearch, setRoomSearch, 
    selectedRoom, setSelectedRoom, step, goNext, goBack, 
    form, setField, errors, submitting, submitDone, handleSubmit, reset,
    page, setPage, totalPages 
  };
}