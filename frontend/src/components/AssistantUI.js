import React, { useState, useEffect } from "react";
import { sendTask, getLogs } from "../api";

export default function AssistantUI() {
  const [task, setTask] = useState("");
  const [response, setResponse] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const res = await getLogs();
      if (res && res.data) setLogs(res.data.slice().reverse());
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!task.trim()) return;
    setLoading(true);
    try {
      const res = await sendTask(task);
      setResponse(res.data);
      setTask("");
      await fetchLogs();
    } catch (err) {
      console.error(err);
      alert("Error sending task. See console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder='Enter task e.g. "summarize calls"'
          style={{ flex: 1, padding: 10, fontSize: 16 }}
        />
        <button type="submit" style={{ padding: "10px 16px" }} disabled={loading}>
          {loading ? "Processing..." : "Send"}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: 18, padding: 12, background: "#f6f8fa", borderRadius: 6 }}>
          <h3>Response</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h3>Logs</h3>
        {logs.length === 0 && <div>No logs yet.</div>}
        <ul>
          {logs.map(log => (
            <li key={log.id} style={{ marginBottom: 8 }}>
              <div><strong>{log.task}</strong> <small>({new Date(log.timestamp).toLocaleString()})</small></div>
              <div style={{ fontSize: 13, color: "#333" }}>{log.response?.summary}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
