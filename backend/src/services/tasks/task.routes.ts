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
    const userId = parseInt(req.query.userId as string);
    const source = req.query.source as string;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Valid userId is required' });
    }

    try {
        const whereClause: any = { user_id: userId };
        if (source) {
            whereClause.source = source;
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            orderBy: { start_time: 'asc' }
        });

        res.json({ tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

router.post('/', async (req: express.Request, res: express.Response) => {
    const { start_time, end_time, user_id, name, description, priority, color }: Task = req.body;
    try {
        const task: Task = await createTask(
            new Date(start_time),
            new Date(end_time),
            user_id,
            { name, description, priority, color }
        );
        res.status(201).json(JSON.stringify(task));
    } catch (error) {
        res.status(400).json({ error: '400: Bad Request' });
        console.log(error);
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

export default router;