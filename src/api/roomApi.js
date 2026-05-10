import axiosInstance from "./axiosInstance";

export const roomApi = {
  // ── Rooms ──────────────────────────────────────────────────────────────
  getRooms: async (params = {}, signal) => {
    const { keyword, status, page = 0, size = 10 } = params;

    let isActive;
    if (status === "active") isActive = true;
    else if (status === "inactive") isActive = false;

    const queryParams = { page, size };
    if (keyword?.trim()) queryParams.keyword = keyword.trim();
    if (isActive !== undefined) queryParams.isActive = isActive;

    return axiosInstance.get("/rooms", { params: queryParams, signal });
  },

  createRoom: async (data) => axiosInstance.post("/rooms", data),

  updateRoom: async (id, data) => axiosInstance.put(`/rooms/${id}`, data),

  deactivateRoom: async (id) =>
    axiosInstance.patch(`/rooms/${id}/status`, null, {
      params: { isActive: false },
    }),

  activateRoom: async (id) =>
    axiosInstance.patch(`/rooms/${id}/status`, null, {
      params: { isActive: true },
    }),

  getRoomStats: async () => axiosInstance.get("/rooms/stats"),

  // ── Staff (Teacher) Assignment ─────────────────────────────────────────
  // GET /api/rooms/{roomId}/staff
  getRoomStaff: async (roomId) => axiosInstance.get(`/rooms/${roomId}/staff`),

  // GET /api/rooms/{roomId}/staff/assignable?keyword=
  getAssignableTeachers: async (roomId, keyword) => {
    const params = {};
    if (keyword?.trim()) params.keyword = keyword.trim();
    return axiosInstance.get(`/rooms/${roomId}/staff/assignable`, { params });
  },

  // POST /api/rooms/{roomId}/staff  body: { userId }
  assignStaff: async (roomId, userId) =>
    axiosInstance.post(`/rooms/${roomId}/staff`, { userId }),

  // DELETE /api/rooms/{roomId}/staff/{userId}
  removeStaff: async (roomId, userId) =>
    axiosInstance.delete(`/rooms/${roomId}/staff/${userId}`),

  // ── Room Inventory ─────────────────────────────────────────────────────
  getRoomInventory: async (roomId) =>
    axiosInstance.get(`/inventory/rooms/${roomId}`),

  distributeSupply: async (data) =>
    axiosInstance.post("/inventory/distribute", data),

  getDistributionHistory: async (roomId) =>
    axiosInstance.get("/inventory/distribute/history", {
      params: roomId ? { roomId } : undefined,
    }),
};
