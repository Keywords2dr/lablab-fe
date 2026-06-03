import { useState, useCallback, useRef, useEffect } from "react";
import { rentTicketApi } from "../../../../api/rentTicketApi";

export function useApproveTickets() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pg, setPg] = useState({ page: 0, size: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ ticketType: "" });
  const fRef = useRef(filters);

  const fetchData = useCallback(async (page = 0, size = 10, f) => {
    const cur = f ?? fRef.current;
    setLoading(true);
    try {
      const res = await rentTicketApi.getAllForAdmin({
        page,
        size,
        status: "PENDING_ADMIN",
        ...(cur.ticketType ? { ticketType: cur.ticketType } : {}),
      });
      setData(res?.data?.content ?? []);
      setPg({
        page,
        size,
        total: res?.data?.totalElements ?? 0,
        totalPages: res?.data?.totalPages ?? 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(0, 10, fRef.current);
  }, [fetchData]);

  const apply = (field, value) => {
    const next = { ...filters, [field]: value };
    setFilters(next);
    fRef.current = next;
    fetchData(0, pg.size, next);
  };

  const reset = () => {
    const def = { ticketType: "" };
    setFilters(def);
    fRef.current = def;
    fetchData(0, 10, def);
  };

  const goPage = (p) => fetchData(p, pg.size);
  const changePage = (p) => fetchData(p, pg.size);

  return {
    data,
    loading,
    pg,
    filters,
    apply,
    reset,
    goPage,
    changePage,
    fetchData,
  };
}
