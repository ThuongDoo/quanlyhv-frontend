// src/api/api.js
import axios from "axios";
import { getToken, clearToken } from "../hooks/useAuth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    const parts = [];
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
      } else if (value !== undefined && value !== null) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    return parts.join("&");
  },
});

// "2024-05-12"           → local midnight → UTC ISO
// "2024-05-12T08:30"     → local datetime → UTC ISO
// Already has Z or +offset → unchanged
function normalizeDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d).toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) && !value.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value).toISOString();
  }
  return value;
}

function deepNormalizeDates(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof FormData) return obj;
  if (Array.isArray(obj)) return obj.map(deepNormalizeDates);
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, deepNormalizeDates(v)])
    );
  }
  if (typeof obj === "string") return normalizeDate(obj);
  return obj;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data && !(config.data instanceof FormData)) {
    config.data = deepNormalizeDates(config.data);
  }
  if (config.params) {
    config.params = deepNormalizeDates(config.params);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;

    // 401 → hết phiên, về login
    if (status === 401) {
      clearToken();
      window.location.href = "/login";
    }

    // Normalize message từ backend vào error.message
    // Backend trả { error: "..." } hoặc { message: "..." }
    const serverMsg =
      error?.response?.data?.error ||
      error?.response?.data?.message;

    const defaultMsg =
      status >= 500 ? "Lỗi máy chủ, vui lòng thử lại sau." :
      status === 403 ? "Bạn không có quyền thực hiện thao tác này." :
      status === 404 ? "Không tìm thấy dữ liệu." :
      "Đã có lỗi xảy ra.";

    error.message = serverMsg || defaultMsg;
    return Promise.reject(error);
  },
);

export default api;
