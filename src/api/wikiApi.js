// src/api/chemicalApi.js
import axios from 'axios';

const API_URL = '/api/chemicals';

export const chemicalApi = {
  // Lấy danh sách cho Wiki
  getChemicals: (params) => {
    return axios.get(API_URL, { params });
  },

  // Lấy chi tiết một hóa chất (sẽ cần thêm sau ở BE)
  getChemicalById: (id) => {
    return axios.get(`${API_URL}/${id}`);
  },

  // Lấy options cho filter
  getFormOptions: () => {
    return axios.get(`${API_URL}/form-options`);
  },
};