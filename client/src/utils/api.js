import axios from "axios";

const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

// Attach access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints to avoid infinite loops
    if (
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/register") ||
      originalRequest?.url?.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(
            "/api/auth/refresh",
            { refreshToken },
            { withCredentials: true }
          );

          if (res.data?.accessToken) {
            localStorage.setItem("accessToken", res.data.accessToken);
            if (res.data.refreshToken) {
              localStorage.setItem("refreshToken", res.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return axios(originalRequest);
          }
        } catch (refreshErr) {
          // Refresh token expired or revoked - clear storage only if strictly unauthorized
          if (refreshErr.response?.status === 401 || refreshErr.response?.status === 403) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
