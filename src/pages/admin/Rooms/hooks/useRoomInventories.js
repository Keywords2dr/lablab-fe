import { useState, useCallback } from "react";
import { roomApi } from "../../../../api/roomApi";
import { toast } from "react-toastify";

export function useRoomInventories() {
  const [inventories, setInventories] = useState({}); // { roomId: [items...] }
  const [loading, setLoading] = useState(false);

  const fetchInventories = useCallback(async (roomIds) => {
    setLoading(true);
    try {
      const promises = roomIds.map(async (id) => {
        const res = await roomApi.getRoomInventory(id, 0, 500);
        return { roomId: id, items: res.data || [] };
      });
      const results = await Promise.all(promises);
      
      const newInv = {};
      results.forEach((res) => {
        newInv[res.roomId] = res.items;
      });
      
      setInventories((prev) => ({ ...prev, ...newInv }));
    } catch (error) {
      console.error("Lỗi khi tải kho phòng:", error);
      toast.error("Không thể tải dữ liệu vật tư trong phòng!");
    } finally {
      setLoading(false);
    }
  }, []);

  return { inventories, loading, fetchInventories };
}
