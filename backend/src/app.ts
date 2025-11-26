import dotenv from 'dotenv';
import express from 'express';

// Load environment variables FIRST
dotenv.config();

import taskRoutes from './services/tasks/task.routes.js';
import userRoutes from './services/users/user.routes.js';
import googleCalendarRoutes from './services/google-calendar/google-calendar.routes.js';
import assistantRoutes from './services/assistant/assistant.routes.js';
import canvasRoutes from './services/canvas/canvas.routes.js';
// import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Enable CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Google Calendar routes (works without database)
app.use('/api/google-calendar', googleCalendarRoutes);

// Assistant routes (AI task creation)
app.use('/api/assistant', assistantRoutes);

// Canvas integration routes
app.use('/api/canvas', canvasRoutes);

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;