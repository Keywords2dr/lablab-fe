import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { chemicalApi } from "../../../../api/chemicalApi";
import { roomApi } from "../../../../api/roomApi";

const normalizeChemical = (item = {}) => ({
  itemId: item.itemId ?? "",
  itemCode: item.itemCode ?? "",
  itemName: item.name ?? item.itemName ?? "",
  unit: item.unit ?? "",
  packaging: item.packaging ?? "",
  amountPerPackage: item.amountPerPackage ?? null,
  supplier: item.supplier ?? "",
  formula: item.formula ?? "",
  packageHint: item.amountPerPackage
    ? `1 ${item.packaging || "chai"} = ${item.amountPerPackage} ${item.unit}`
    : null,
});

export function useInventory() {
  const [globalItems, setGlobalItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const abortRef = useRef(null);

  // ── Lấy danh sách hóa chất từ GET /api/chemicals ────────────────────
  const fetchGlobalInventory = useCallback(async (keyword = "") => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await chemicalApi.getChemicals(
        {
          keyword: keyword.trim() || undefined,
          page: 0,
          size: 200,
          sortBy: "name",
          sortDir: "asc",
        },
        abortRef.current.signal,
      );
      const content = res.data?.content ?? [];
      setGlobalItems(content.map(normalizeChemical));
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        console.error("[useInventory] fetchGlobalInventory failed:", err);
        toast.error("Không thể tải danh sách hóa chất. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalInventory();
    return () => abortRef.current?.abort();
  }, [fetchGlobalInventory]);

  // ── Phân phối ────────────────────────────────────────────────────────
  /**
   * @param {Array<{ roomId: string, items: Array<{ itemId: string, packageCount: number }> }>} allocations
   * @param {string} note
   */
  const allocate = useCallback(
    async (allocations, note = "") => {
      setSubmitting(true);
      try {
        await roomApi.allocateSupply({ allocations, note });
        toast.success("Đã phân phối vật tư thành công vào các phòng Lab.");
        await fetchGlobalInventory();
        return true;
      } catch (err) {
        console.error("[useInventory] allocate failed:", err);
        const msg =
          err?.response?.data?.message ??
          "Phân phối thất bại. Vui lòng thử lại.";
        toast.error(msg);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchGlobalInventory],
  );

  // ── Thu hồi ──────────────────────────────────────────────────────────
  /**
   * @param {Array<{ roomId: string, items: Array<{ itemId: string, packageCount: number }> }>} revocations
   * @param {string} note
   */
  const revoke = useCallback(
    async (revocations, note = "") => {
      setSubmitting(true);
      try {
        await roomApi.revokeSupply({ revocations, note });
        toast.success("Đã thu hồi vật tư khỏi phòng Lab thành công.");
        await fetchGlobalInventory();
        return true;
      } catch (err) {
        console.error("[useInventory] revoke failed:", err);
        const msg =
          err?.response?.data?.message ?? "Thu hồi thất bại. Vui lòng thử lại.";
        toast.error(msg);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchGlobalInventory],
  );

  return {
    globalItems,
    loading,
    submitting,
    fetchGlobalInventory,
    allocate,
    revoke,
  };
}