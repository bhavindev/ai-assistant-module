# 🚀 AI Assistant Module - Production Ready

A **production-ready AI assistant service** built with modern Node.js practices, comprehensive testing, and enterprise-grade code quality standards.

## 🚀 Quick Start

### **Prerequisites**
- Node.js ≥20.11.0
- npm ≥10.0.0

### **Clone Project**

Clone URL: `git clone https://github.com/bhavindev/ai-assistant-module.git`

### **Backend Setup**
cd backend
npm install
npm run dev

### **Frontend Setup**
cd frontend
npm install
npm start

## 🎯 Features

### 🏗️ **Production Architecture**
- **Node.js 20.11.0** with ES modules
- **Express 4.x** with structured middleware
- **Service-Repository pattern** for clean architecture
- **Zod validation** with detailed error responses
- **JSONL storage** with path traversal protection

## 📋 API Endpoints

### `POST /assist`
Process an AI assistant message
```bash
curl -X POST http://localhost:5000/assist \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello AI assistant", "sessionId": "optional-uuid"}'
```

**Response:**
```json
{
  "reply": "[AI Assistant]: Received your message: \"Hello AI assistant\". Processing complete.",
  "messageId": "550e8400-e29b-41d4-a716-446655440000",
  "ts": "2025-10-17T11:00:00.000Z"
}
```

### `GET /logs?limit=50`
Retrieve recent interaction logs
```bash
curl http://localhost:5000/logs?limit=10
```

### `DELETE /logs`
Clear all logs (development only)
```bash
curl -X DELETE http://localhost:5000/logs
```

### `GET /health`
Health check with storage metrics
```bash
curl http://localhost:5000/health
```

### **Run Tests**
cd backend
npm test                 # Run all tests
npm run test:coverage    # Generate coverage report
npm run lint             # Check code style
npm run format:check     # Check formatting

## 🏗️ Architecture

### **Project Structure**
```
backend/
├── src/
│   ├── interfaces/          # Abstract interfaces
│   ├── services/            # Business logic
│   ├── repositories/        # Data access layer
│   ├── routes/              # API endpoints
│   ├── middleware/          # Request validation
│   └── schemas/             # Zod validation schemas
├── tests/
│   ├── unit/                # Unit tests
│   └── e2e/                 # End-to-end tests
├── data/                    # JSONL storage
└── server.js                # Application entry point

## 🔗 Links

- **Repository:**: https://github.com/bhavindev/ai-assistant-module
- **CI/CD:**: https://github.com/bhavindev/ai-assistant-module/actions
- **Issues:**: https://github.com/bhavindev/ai-assistant-module/issues