/**
 * Centralized API helper for AutoPulse (Using Axios).
 *
 * Automatically:
 *  - Prefixes every request with API_BASE_URL
 *  - Attaches Authorization: Bearer <token> from the Zustand store
 *  - Parses JSON responses automatically via Axios
 *  - Throws on non-2xx status (with the server's message if available)
 *  - Retries the request if 401 Unauthorized occurs using the refresh token
 *  - Calls logout() and navigates to login if session cannot be recovered
 */

import axios from "axios";
import { router } from "expo-router";
import { API_BASE_URL } from "../config";
import { useAuthStore } from "./useAuthStore";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh Token
axiosInstance.interceptors.response.use(
  (response) => {
    // To mimic original wrapper, return just the data payload
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const data = error.response?.data;
    const status = error.response?.status;
    const endpoint = originalRequest.url;

    if (status === 401 && !originalRequest._retry) {
      const isAuthError =
        data?.message === "Invalid credentials" ||
        data?.message === "Current password is incorrect" ||
        (endpoint && endpoint.includes("/auth/refresh")) ||
        (endpoint && endpoint.includes("/auth/login"));

      if (!isAuthError) {
        if (isRefreshing) {
          // If already refreshing, wait for it to finish and retry
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const currentRefreshToken = useAuthStore.getState().refreshToken;

        if (currentRefreshToken) {
          try {
            const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken: currentRefreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = refreshRes.data;
            useAuthStore.getState().setTokens(accessToken, newRefreshToken);
            
            processQueue(null, accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            console.log("Token refresh failed:", refreshErr);
            // Fall through to logout
          } finally {
            isRefreshing = false;
          }
        }

        // Token refresh failed or missing refresh token
        useAuthStore.getState().logout();
        router.replace("/(auth)/LoginPage");
        throw new Error("Session expired. Please log in again.");
      }
    }

    // Pass the actual error message like the original fetch implementation did
    if (data && data.message) {
      throw new Error(data.message);
    }
    
    throw new Error(error.message || `Request failed (${status})`);
  }
);

// ── Convenience methods ────────────────────────────────────────────────────────

const api = {
  get: (endpoint, options = {}) => axiosInstance.get(endpoint, options),

  post: (endpoint, body, options = {}) => axiosInstance.post(endpoint, body, options),

  put: (endpoint, body, options = {}) => axiosInstance.put(endpoint, body, options),

  patch: (endpoint, body, options = {}) => axiosInstance.patch(endpoint, body, options),

  delete: (endpoint, body, options = {}) => 
    axiosInstance.delete(endpoint, { data: body, ...options }),

  /** For multipart/form-data uploads (images, files) */
  upload: (endpoint, formData, options = {}) =>
    axiosInstance.post(endpoint, formData, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default api;
