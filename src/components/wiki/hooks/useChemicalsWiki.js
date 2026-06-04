import { useState, useEffect, useCallback } from "react";
import { chemicalApi } from "../../../api/chemicalApi";

export const useChemicalsWiki = () => {
  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [formOptions, setFormOptions] = useState({
    categories: [],
    suppliers: [],
    units: [],
    packagings: [],
  });

  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    supplier: "",
    unit: "",
    packaging: "",
  });

  // Fetch danh sách hóa chất
  const fetchChemicals = useCallback(async (page = 0) => {
    setLoading(true);
    
    // Clear dữ liệu cũ ngay lập tức để tránh hiện dữ liệu trang trước
    setChemicals([]);

    try {
      const response = await chemicalApi.getChemicals({
        ...filters,
        page,
        size: 12,
        sortBy: "name",
        sortDir: "asc",
      });

      const data = response.data || {};
      
      setChemicals(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Lỗi tải danh sách hóa chất:", error);
      setChemicals([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Chuyển trang
  const goToPage = useCallback((page) => {
    const targetPage = Math.max(0, Math.min(page, totalPages - 1));
    if (targetPage !== currentPage) {
      fetchChemicals(targetPage);
    }
  }, [fetchChemicals, totalPages, currentPage]);

  // Fetch form options (categories, suppliers, units...)
  const fetchFormOptions = useCallback(async () => {
    try {
      const res = await chemicalApi.getFormOptions();
      setFormOptions(res.data);
    } catch (error) {
      console.error("Lỗi tải form options:", error);
    }
  }, []);

  // Load form options khi mount
  useEffect(() => {
    fetchFormOptions();
  }, [fetchFormOptions]);

  // Load dữ liệu khi filters thay đổi (reset về trang 1)
  useEffect(() => {
    fetchChemicals(0);
  }, [filters, fetchChemicals]);

  const applyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: "",
      category: "",
      supplier: "",
      unit: "",
      packaging: "",
    });
  };

  return {
    chemicals,
    loading,
    totalElements,
    totalPages,
    currentPage,
    filters,
    formOptions,
    applyFilters,
    resetFilters,
    fetchChemicals,
    goToPage,
  };
};