import AssistantUI from "./components/AssistantUI";
import "./App.css";

function App() {
  return (
    <div>
      <header
        style={{
          padding: 20,
          textAlign: "center",
          background: "#282c34",
          color: "white",
        }}
      >
        <h1>AI Assistant Module — Demo</h1>
      </header>
      <main style={{ padding: 20 }}>
        <AssistantUI />
      </main>
    </div>
  );
}

export default App;
