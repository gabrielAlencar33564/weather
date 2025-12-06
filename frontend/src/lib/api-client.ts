import axios from "axios";

const resolveApiBaseUrl = (): string => {
  const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const envUrl = rawUrl || "";

  if (!envUrl) {
    console.warn("[api-client] Nenhuma VITE_API_URL  encontrada. Defina no .env.");
    return "/api";
  }

  return envUrl.replace(/\/+$/, "") + "/api";
};

export const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token: string | null) => {
  if (!token) {
    delete api.defaults.headers.common["Authorization"];
    return;
  }
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};
