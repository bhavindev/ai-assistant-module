import express from 'express';
import cors from 'cors';
import assistantRoutes from './src/routes/assistant.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.info(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/', assistantRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'NotFoundError',
    details: [{ path: [], message: `Route ${req.method} ${req.path} not found` }],
  });
});

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    details: [{ path: [], message: 'An unexpected error occurred' }],
  });
});

app.listen(PORT, () => {
  console.info(`🚀 Server running on PORT:${PORT}`);
});
