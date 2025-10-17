import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
});

export const sendTask = (message, sessionId = null) => {
  const payload = { message };
  if (sessionId) {
    payload.sessionId = sessionId;
  }
  return API.post("/assist", payload);
};

export const getLogs = (limit = 50) => API.get(`/logs?limit=${limit}`);
export const clearLogs = () => API.delete("/logs");