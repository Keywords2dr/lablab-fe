import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { reportApi } from '../../../../api/reportApi';
import { roomApi } from '../../../../api/roomApi';

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterRoomId, setFilterRoomId] = useState('');

  // Rooms for filter dropdown
  const [rooms, setRooms] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  // Fetch rooms for filter
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomApi.getRooms({ size: 100 });
        const data = res.data?.content || res.data || [];
        setRooms(Array.isArray(data) ? data : []);
      } catch {
        // silent
      }
    };
    fetchRooms();
  }, []);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: PAGE_SIZE };
      if (filterType) params.reportType = filterType;
      if (filterRoomId) params.roomId = filterRoomId;
      const res = await reportApi.getAllReports(params);
      const data = res.data;
      setReports(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterRoomId]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Derived Stats
  const totalCount = totalElements;
  const roomCount = filterType === '' ? reports.filter(r => r.reportType === 'ROOM').length : (filterType === 'ROOM' ? reports.length : 0);
  const chemicalCount = filterType === '' ? reports.filter(r => r.reportType === 'CHEMICAL').length : (filterType === 'CHEMICAL' ? reports.length : 0);

  return {
    reports,
    loading,
    selected,
    setSelected,
    filterType,
    setFilterType,
    filterRoomId,
    setFilterRoomId,
    rooms,
    page,
    setPage,
    totalPages,
    totalElements,
    fetchReports,
    totalCount,
    roomCount,
    chemicalCount,
  };
}
