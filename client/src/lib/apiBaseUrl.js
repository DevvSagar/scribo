const normalizeBaseUrl = (value) =>
  typeof value === "string" ? value.trim().replace(/\/+$/, "") : "";

const configuredBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);

// Use same-origin requests in production so auth cookies are first-party on Vercel.
export const API_BASE_URL = import.meta.env.DEV ? configuredBaseUrl : "";

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;
