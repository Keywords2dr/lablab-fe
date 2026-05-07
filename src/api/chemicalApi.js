import axiosInstance from "./axiosInstance";

export const chemicalApi = {
  getChemicals: (params = {}, signal) =>
    axiosInstance.get("/chemicals", { params, signal }),

  getInventoryGlobal: () =>
    axiosInstance.get("/inventory/chemicals/global"),

  getFormOptions: () =>
    axiosInstance.get("/chemicals/form-options"),

  createChemical: (data) =>
    axiosInstance.post("/chemicals", data),

  updateChemical: (id, data) =>
    axiosInstance.put(`/chemicals/${id}`, data),

  deleteChemical: (id) =>
    axiosInstance.delete(`/chemicals/${id}`),

  restoreChemical: (id) =>
    axiosInstance.put(`/chemicals/${id}/restore`),

  getTrash: () =>
    axiosInstance.get("/chemicals/trash"),

  importChemicals: (file, onProgress) => {
    const form = new FormData();
    form.append("file", file);
    return axiosInstance.post("/chemicals/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
  },

  exportChemicals: () =>
    axiosInstance.get("/chemicals/export", { responseType: "blob" }),
};

