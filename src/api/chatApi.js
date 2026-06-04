import axiosInstance from "./axiosInstance";

export const chatApi = {
  sendMessage: (message, history = []) =>
    axiosInstance.post("/chat", { message, history }),
};
