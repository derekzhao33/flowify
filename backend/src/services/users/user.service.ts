import { type User } from "../../generated/prisma/client.js";
import { type Task } from "../../generated/prisma/client.js";
import prisma from "../../shared/prisma.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function getUser(
    id: number, 
): Promise<User | null> {
    const result: User | null =  await prisma.user.findUnique({
        where: {
            id,
        }
    });

    return result;
}

export async function getUserByEmail(
    email: string, 
): Promise<User | null> {
    const result: User | null =  await prisma.user.findUnique({
        where: {
            email,
        }
    });

    return result;
}

export async function getAllTasksForUser(
    userId: number,
): Promise<Task[] | null> {
    return await prisma.task.findMany({
        where: {
            user: {
                is: {
                    id: userId,
                }
            }
        }
    });
}

export async function getTaskForUser(
    userId: number,
    taskId: number,
): Promise<Task | null> {
    return await prisma.task.findUnique({
        where: {
            user: {
                is: {
                    id: userId,
                }
            },

            id: taskId,
        }
    });
}
 
// TODO: Add email validation (with zod?)

export async function createUser(
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string,
): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result: User = await prisma.user.create({
        data: {
            first_name: firstName,
            last_name: lastName,
            email,
            password: hashedPassword,
        },
    });

    return result;
}

export async function verifyPassword(
    plainPassword: string,
    hashedPassword: string,
): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function updateUser(
    id: number,
    data: Partial<User>,
): Promise<User> {
    // If password is being updated, hash it first
    if (data.password) {
        data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }
    
    const updatedUser: User = await prisma.user.update({
        where: { id },
        data,
    });
    return updatedUser;
}