import React, { useState, useEffect } from "react";
import { sendTask, getLogs, clearLogs } from "../api";

export default function AssistantUI() {
  const [task, setTask] = useState("");
  const [response, setResponse] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const res = await getLogs();
      if (res && res.data) setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError("Could not load logs.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!task.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await sendTask(task);
      setResponse(res.data);
      setTask("");
      await fetchLogs();
    } catch (err) {
      console.error(err);
      setError("Error sending task.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClearLogs() {
    if (!window.confirm("Are you sure you want to clear all logs?")) return;
    await clearLogs();
    setLogs([]);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Assistant Console</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 8, marginTop: 10 }}
      >
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder='Enter task e.g. "summarize calls"'
          style={{ flex: 1, padding: 10, fontSize: 16 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 16px" }}
        >
          {loading ? "Processing..." : "Send"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}

      {response && (
        <div
          style={{
            marginTop: 18,
            padding: 12,
            background: "#f6f8fa",
            borderRadius: 6,
          }}
        >
          <h3>Response</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Logs</h3>
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              style={{
                background: "#f44336",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: 4,
              }}
            >
              Clear Logs
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div style={{ color: "#555" }}>No logs yet. Try adding a task.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {logs.map((log) => (
              <li
                key={log.id}
                style={{
                  marginBottom: 8,
                  background: "#f6f8fa",
                  padding: 10,
                  borderRadius: 4,
                }}
              >
                <div>
                  <strong>{log.task}</strong>{" "}
                  <small style={{ color: "#666" }}>
                    ({new Date(log.timestamp).toLocaleString()})
                  </small>
                </div>
                <div style={{ fontSize: 13, color: "#333" }}>
                  {log.response?.summary}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
