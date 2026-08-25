import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
});

// Attach the stored JWT as a Bearer token on every request.
// This is the cross-origin-safe auth mechanism — works on Render (or any
// setup where the frontend and backend are on different domains) without
// relying on cookies crossing domain boundaries.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
