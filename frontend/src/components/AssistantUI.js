import React, { useState, useEffect } from "react";
import { sendTask, getLogs, clearLogs } from "../api";

export default function AssistantUI() {
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
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
    if (!message.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await sendTask(message, sessionId || null);
      setResponse(res.data);
      setMessage("");
      await fetchLogs();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error === 'ValidationError') {
        setError(`Validation Error: ${err.response.data.details.map(d => d.message).join(', ')}`);
      } else {
        setError("Error sending message.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleClearLogs() {
    if (!window.confirm("Are you sure you want to clear all logs?")) return;
    await clearLogs();
    setError(null);
    setLogs([]);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>AI Assistant Console</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Enter message (max 2000 chars)'
            style={{ flex: 1, padding: 10, fontSize: 16 }}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 16px" }}
          >
            {loading ? "Processing..." : "Send"}
          </button>
        </div>
        <input
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder='Session ID (optional UUID)'
          style={{ padding: 8, fontSize: 14 }}
        />
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
          <div style={{ color: "#555" }}>No logs yet. Try sending a message.</div>
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
                  <strong>{log.message}</strong>{" "}
                  <small style={{ color: "#666" }}>
                    ({new Date(log.timestamp).toLocaleString()})
                  </small>
                  {log.sessionId && (
                    <small style={{ color: "#999", marginLeft: 8 }}>
                      Session: {log.sessionId.slice(0, 8)}...
                    </small>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#333", marginTop: 4 }}>
                  <strong>Reply:</strong> {log.reply}
                </div>
                {log.confidence && (
                  <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                    Confidence: {(log.confidence * 100).toFixed(0)}%
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
