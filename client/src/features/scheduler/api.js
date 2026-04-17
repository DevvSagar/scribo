const API_BASE_URL = import.meta.env.VITE_API_URL;

const parseJson = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
};

const request = async (path, options = {}) => {
  if (!API_BASE_URL) {
    throw new Error("Missing API URL configuration.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  return parseJson(response);
};

export const getGoogleCalendarStatus = () =>
  request("/api/schedule/google/status");

export const getGoogleCalendarConnectUrl = () =>
  `${API_BASE_URL}/api/schedule/google/connect`;

export const disconnectGoogleCalendar = () =>
  request("/api/schedule/google/disconnect", {
    method: "DELETE",
  });

export const getScheduledMeetings = ({ page = 1, limit = 10, status = "upcoming" } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
  });

  return request(`/api/schedule/my-meetings?${params.toString()}`);
};

export const getSyncedMeetings = ({ status = "upcoming" } = {}) => {
  const params = new URLSearchParams({
    status,
  });

  return request(`/api/schedule/synced-meetings?${params.toString()}`);
};

export const createScheduledMeeting = (payload) =>
  request("/api/schedule/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteScheduledMeeting = (meetingId) =>
  request(`/api/schedule/delete/${encodeURIComponent(meetingId)}`, {
    method: "DELETE",
  });
