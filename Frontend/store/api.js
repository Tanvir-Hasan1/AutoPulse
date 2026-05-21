/**
 * Centralized API helper for AutoPulse.
 *
 * Automatically:
 *  - Prefixes every request with API_BASE_URL
 *  - Attaches Authorization: Bearer <token> from the Zustand store
 *  - Parses JSON responses
 *  - Throws on non-2xx status (with the server's message if available)
 *  - Calls logout() on 401 Unauthorized
 */

import { API_BASE_URL } from "../config";
import { useAuthStore } from "./useAuthStore";

/**
 * Core fetch wrapper.
 * @param {string} endpoint  — e.g. "/bikes/user/123"
 * @param {RequestInit} options — standard fetch options
 * @returns {Promise<any>} parsed JSON body
 */
const request = async (endpoint, options = {}) => {
  const token = useAuthStore.getState().accessToken;
  const logout = useAuthStore.getState().logout;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, { ...options, headers });

  // Auto-logout on 401
  if (response.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  // Try to parse JSON regardless of status
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
};

// ── Convenience methods ────────────────────────────────────────────────────────

const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { method: "GET", ...options }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),

  delete: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "DELETE",
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...options,
    }),

  /** For multipart/form-data uploads (images, files) */
  upload: (endpoint, formData, options = {}) => {
    const token = useAuthStore.getState().accessToken;
    return request(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type — let browser/RN set it with boundary
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  },
};

export default api;
