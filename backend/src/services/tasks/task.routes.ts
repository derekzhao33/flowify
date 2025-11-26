import express from 'express';
import { type Task } from '../../generated/prisma/client.js'
import { Router } from 'express';
import prisma from '../../shared/prisma.js';
import {
    createTask,
    updateTask,
    deleteTask,
} from './task.service';

const router: Router = Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    const user_id = Number(req.query.user_id);
    if (!user_id) {
        res.status(400).json({ error: 'user_id is required' });
        return;
    }
    try {
        const tasks = await prisma.task.findMany({
            where: { user_id },
            orderBy: { start_time: 'asc' }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
        console.log(error);
    }
});

router.post('/', async (req: express.Request, res: express.Response) => {
    const { start_time, end_time, user_id, name, description, priority, color }: any = req.body;
    try {
        const task: Task = await createTask(
            new Date(start_time), 
            new Date(end_time), 
            user_id,
            name,
            description,
            priority,
            color
        );
        res.status(201).json(task);
    } catch (error) {
        console.error('Task creation error:', error);
        res.status(400).json({ error: 'Failed to create task' });
    }
});

router.put('/:id', async (req: express.Request, res: express.Response) => {
    const id: number = Number(req.params.id);
    const data: Task = req.body;
    try {
        const task: Task | null = await updateTask(id, data);
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Task update failed' });
    }
});

router.delete('/:id', async (req: express.Request, res: express.Response) => {
    const id: number = Number(req.params.id);
    try {
        const task: Task | null = await deleteTask(id);
        if (task) {
            res.json({ message: 'Task deleted', task });
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Task deletion failed' });
    }
});

// Cleanup endpoint to remove duplicate tasks
router.post('/cleanup-duplicates', async (req: express.Request, res: express.Response) => {
    try {
        const { taskIds }: { taskIds: number[] } = req.body;
        
        if (!taskIds || !Array.isArray(taskIds)) {
            return res.status(400).json({ error: 'taskIds array is required' });
        }

        const deleted = await prisma.task.deleteMany({
            where: {
                id: { in: taskIds }
            }
        });

        res.json({ 
            message: `Deleted ${deleted.count} tasks`, 
            count: deleted.count 
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ error: 'Cleanup failed' });
    }
});

export default router;