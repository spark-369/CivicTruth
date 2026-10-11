import axios from "axios";
import { getToken, clearAuthToken } from "../utils/auth";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints that legitimately return 401 for bad credentials; do not treat
// these as an expired session.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register"];

API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Only treat 401 as an expired/invalid session. Skip auth endpoints so a
    // failed login/register attempt doesn't trigger a redirect.
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => url.includes(path));

    if (status === 401 && !isAuthEndpoint) {
      clearAuthToken();
      if (typeof window !== "undefined") {
        const alreadyOnLogin = window.location.pathname === "/login";
        if (!alreadyOnLogin) {
          // Preserve the intended destination so the user returns after login.
          const redirect = window.location.pathname + window.location.search;
          window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updateMe: (data) => API.put("/auth/me", data),
};

export const participantsAPI = {
  list: (params) => API.get("/participants/", { params }),
  get: (id) => API.get(`/participants/${id}`),
  create: (data) => API.post("/participants/", data),
  update: (id, data) => API.put(`/participants/${id}`, data),
  remove: (id) => API.delete(`/participants/${id}`),
};

export const blockchainAPI = {
  create: (data) => API.post("/blockchain/", data),
  list: () => API.get("/blockchain/"),
  verifyChain: () => API.get("/blockchain/chain/verify"),
  get: (id) => API.get(`/blockchain/${id}`),
  update: (id, data) => API.put(`/blockchain/${id}`, data),
  remove: (id) => API.delete(`/blockchain/${id}`),
};

export const settingsAPI = {
  list: (params) => API.get("/settings/", { params }),
  get: (id) => API.get(`/settings/${id}`),
  update: (id, data) => API.put(`/settings/${id}`, data),
};

export const notificationsAPI = {
  list: () => API.get("/notifications/"),
  create: (data) => API.post("/notifications/", data),
  update: (id, data) => API.put(`/notifications/${id}`, data),
  remove: (id) => API.delete(`/notifications/${id}`),
  markRead: (id, isRead = true) =>
    API.patch(`/notifications/${id}/read`, { is_read: isRead }),
};

export const verifyAPI = {
  run: (data) => API.post("/verify/", data),
};

export default API;
