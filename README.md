# 🧩 AI Assistant Module (Test 1 of 2)

This project simulates an internal **AI assistant module** as described in the test brief.  
It receives a short task, returns a structured simulated response, and logs all interactions in a local JSON file.

---

## Tech Stack
- **Frontend:** React (simple form + log viewer)
- **Backend:** Node.js (Express)
- **Storage:** Local JSON file (`data/logs.json`)
- **Extras:** Async simulation to mimic AI processing

---

### How to Run

## Frontend Setup
cd backend
npm install
npm start

## Frontend Setup
cd frontend
npm install
npm start

## Example Usage

Input: summarize client calls

Response:
{
  "task": "summarize client calls",
  "type": "summarize",
  "summary": "Simulated result for task \"summarize client calls\".",
  "actionItems": [
    "1) Understand \"summarize client calls\"",
    "2) Produce short summary",
    "3) (Simulated) suggested steps"
  ],
  "metadata": {
    "processedAt": "2025-10-15T06:44:18.189Z",
    "simulatedConfidence": "99%"
  }
}

All interactions are stored in: backend/data/logs.json

## Notes

This version simulates AI responses. No real AI API is integrated.