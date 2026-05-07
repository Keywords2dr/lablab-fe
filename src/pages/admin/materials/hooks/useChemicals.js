import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { chemicalApi } from "../../../../api/chemicalApi";

const ITEMS_PER_PAGE = 10;

export const DEFAULT_FILTERS = {
  keyword: "",
  packaging: "",
  supplier: "",
  unit: "",
  sort: "itemCode,asc",
};

export function useChemicals() {
  // ── Data state ──────────────────────────────────────
  const [chemicals, setChemicals] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverPage, setServerPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [formOptions, setFormOptions] = useState({
    packagings: [],
    suppliers: [],
    units: [],
  });

  const abortRef = useRef(null);
  const filtersRef = useRef(DEFAULT_FILTERS);

  useEffect(() => { filtersRef.current = filters; }, [filters]);

  // Inventory — fetch 1 lần, data tĩnh
  useEffect(() => {
    chemicalApi.getInventoryGlobal()
      .then((res) => {
        const map = {};
        (res.data || []).forEach((i) => { map[i.itemId] = i; });
        setInventory(map);
      })
      .catch((err) => console.warn("[inventory]", err.message));
  }, []);

  // Form options — fetch 1 lần khi mount
  useEffect(() => {
    chemicalApi.getFormOptions()
      .then((res) => setFormOptions({
        packagings: res.data.packagings || [],
        suppliers: res.data.suppliers || [],
        units: res.data.units || [],
      }))
      .catch((err) => console.warn("[form-options]", err.message));
  }, []);

  // ── Fetch trang hóa chất ────────────────────────────
  const fetchData = useCallback(async (pg = 0, overrideFilters) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const f = overrideFilters ?? filtersRef.current;
    setServerPage(pg); // optimistic update
    setLoading(true);

    try {
      const [sortBy, sortDir] = (f.sort || "itemCode,asc").split(",");
      const params = {
        page: pg,
        size: ITEMS_PER_PAGE,
        sortBy: sortBy || "itemCode",
        sortDir: sortDir || "asc",
        ...(f.keyword ? { keyword: f.keyword } : {}),
        ...(f.packaging ? { packaging: f.packaging } : {}),
        ...(f.supplier ? { supplier: f.supplier } : {}),
        ...(f.unit ? { unit: f.unit } : {}),
      };

      const res = await chemicalApi.getChemicals(params, ctrl.signal);
      if (ctrl.signal.aborted) return;

      const data = res.data;
      setChemicals(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        toast.error("🔒 Không có quyền truy cập. Vui lòng đăng nhập lại.");
      } else {
        toast.error("❌ Lỗi tải: " + (err.response?.data?.message || err.message));
      }
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  const applyFilters = useCallback((patch) => {
    const merged = { ...filtersRef.current, ...patch };
    filtersRef.current = merged;
    setFilters(merged);
    fetchData(0, merged);
  }, [fetchData]);

  const resetFilters = useCallback(() => {
    filtersRef.current = DEFAULT_FILTERS;
    setFilters(DEFAULT_FILTERS);
    fetchData(0, DEFAULT_FILTERS);
  }, [fetchData]);

  useEffect(() => { fetchData(0); }, [fetchData]);

  return {
    chemicals, inventory, loading,
    serverPage, totalPages, totalElements,
    filters, applyFilters, resetFilters,
    fetchData,
    formOptions,
  };
}
