import { Router } from 'express';
import express from 'express';
import { type User } from "../../generated/prisma/client.js";
import { type Task } from "../../generated/prisma/client.js";
import { getUser, createUser, updateUser, getAllTasksForUser, getTaskForUser, getUserByEmail, verifyPassword } from "./user.service.js";

const router: Router = Router();

router.post(
    '/login',
    async (req: express.Request, res: express.Response): Promise<void> => {
        const { email, password }: {
            email: string;
            password: string;
        } = req.body;

        try {
            const user: User | null = await getUserByEmail(email);
            
            if (!user) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }

            // Verify password using bcrypt
            const isPasswordValid = await verifyPassword(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ error: 'Invalid email or password' });
                return;
            }

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        } catch (error) {
            res.status(400).json({ error: '400: Bad Request' });
            console.log(error);
        }
    }
);

router.get('/:id', async (req: express.Request, res: express.Response) => {
    const id: number = Number(req.params.id);
    const user: User | null = await getUser(id);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: '404: Not Found'});
    }
})

router.get('/:userId/tasks/:taskId', async (req: express.Request, res: express.Response) => {
    const userId: number = Number(req.params.userId);
    const taskId: number = Number(req.params.taskId);
    const task: Task | null = await getTaskForUser(userId, taskId);

    if (userId && taskId) {
        res.json(task);
    } else {
        res.status(404).json({ error: "404: Not found" });
    }
})

router.get('/:id/tasks', async (req: express.Request, res: express.Response) => {
    try {
        const tasks: Task[] | null = await getAllTasksForUser(Number(req.params.id));
        res.json(tasks);
    } catch (error) {
        res.status(404).json({ error: "400: Bad Request"});
        console.log(error);
    }
})

router.post(
    '/',
    async (req: express.Request, res: express.Response): Promise<void> => {
        const { first_name, last_name, email, password }: {
            first_name: string;
            last_name: string;
            email: string;
            password: string;
        } = req.body;

        try {
            // Check if user already exists
            const existingUser = await getUserByEmail(email);
            if (existingUser) {
                res.status(409).json({ error: 'Email already exists' });
                return;
            }

            const user: User | null = await createUser(first_name, last_name, email, password);
            
            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            res.status(201).json(userWithoutPassword);
        } catch (error: any) {
            console.error('Error creating user:', error);
            // Handle unique constraint violation from database
            if (error.code === 'P2002') {
                res.status(409).json({ error: 'Email already exists' });
            } else {
                res.status(400).json({ error: error.message || '400: Bad Request' });
            }
        }
    }
);

router.put(
    '/:id',
    async (req: express.Request, res: express.Response): Promise<void> => {
        const id: number = Number(req.params.id);
        const data: Partial<User> = req.body;

        try {
            const user: User | null = await updateUser(id, data);
            if (user) {
                // Return user without password
                const { password: _, ...userWithoutPassword } = user;
                res.status(200).json(userWithoutPassword);
            } else {
                res.status(404).json({ error: '404: Not Found' });
            }
        } catch (error) {
            res.status(400).json({ error: '400: Bad Request' });
        }
    }
);

export default router;
