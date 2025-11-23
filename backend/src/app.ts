import express from 'express';
import cors from 'cors';
import taskRoutes from './services/tasks/task.routes'
import userRoutes from './services/users/user.routes';
import assistantRoutes from './services/assistant/assistant.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite default port and fallback
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

app.use('/api/users', userRoutes);

app.use('/api/assistant', assistantRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;