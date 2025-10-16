import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/assistant",
  timeout: 10000,
});

export const sendTask = (task) => API.post("/", { task });
export const getLogs = () => API.get("/logs");
export const clearLogs = () => API.delete("/logs");