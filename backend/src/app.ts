import express from 'express';
import taskRoutes from './services/tasks/task.routes'
import userRoutes from './services/users/user.routes';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

app.use('/api/users', userRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;