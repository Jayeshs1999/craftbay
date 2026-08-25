import axios from "axios";

const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
});

// Do NOT redirect on 401 here -- middleware.ts handles route protection.
// A 401 on /auth/me just means the user is not logged in; that is normal.
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;