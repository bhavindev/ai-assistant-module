import express from "express";
import cors from "cors";
import assistantRouter from "./routes/assistant.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/assistant", assistantRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on PORT:${PORT}`));
