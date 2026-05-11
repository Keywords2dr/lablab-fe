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

  // ── Staff ──────────────────────────────────────────────────────────────
  getRoomStaff: async (roomId) => axiosInstance.get(`/rooms/${roomId}/staff`),

  getAssignableTeachers: async (roomId, keyword) => {
    const params = {};
    if (keyword?.trim()) params.keyword = keyword.trim();
    return axiosInstance.get(`/rooms/${roomId}/staff/assignable`, { params });
  },

  assignStaff: async (roomId, userId) =>
    axiosInstance.post(`/rooms/${roomId}/staff`, { userId }),

  removeStaff: async (roomId, userId) =>
    axiosInstance.delete(`/rooms/${roomId}/staff/${userId}`),

  // ── Inventory ─────────────────────────────────────────────────────────
  getRoomInventory: async (roomId) =>
    axiosInstance.get(`/inventory/rooms/${roomId}`),

  getChemicalGlobalInventory: async () =>
    axiosInstance.get("/inventory/chemicals/global"),

  allocateSupply: async (data) =>
    axiosInstance.post("/inventory/allocate", data),

  revokeSupply: async (data) => axiosInstance.post("/inventory/revoke", data),
};
