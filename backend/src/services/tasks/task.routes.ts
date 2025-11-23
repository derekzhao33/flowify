import express from 'express';
import { type Task } from '../../generated/prisma/client.js'
import { Router } from 'express';
import {
    getTask,
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
} from './task.service';

const router: Router = Router();

router.get('/', (req: express.Request, res: express.Response) => {
    const tasks: Promise<Task[]> = getAllTasks();
    res.json(tasks);
});

router.get('/:id', (req: express.Request, res: express.Response) => {
    const id: number = Number(req.params.id);
    const task: Promise<Task | null> =  getTask(id);
    if (task) {
        res.json(task);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

router.post('/', async (req: express.Request, res: express.Response) => {
    const { start_time, end_time, user_id }: Task = req.body;
    try {
        const task: Task = await createTask(new Date(start_time), new Date(end_time), user_id);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: 'Task creation failed' });
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