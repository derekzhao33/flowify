import { type User } from "../../generated/prisma/client.js";
import prisma from "../../shared/prisma.js"

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
 
// TODO: Add email validation (with zod?)

export async function createUser(
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string,
): Promise<User> {
    const newUser = {
        first_name: firstName,
        last_name: lastName,
        email, 
        password,
    };

    const result: User = await prisma.user.create({
        data: newUser,
    });

    return result;
}

export async function updateUser(
    id: number,
    data: Partial<User>,
): Promise<User> {
    const updatedUser: User = await prisma.user.update({
        where: { id },
        data,
    });
    return updatedUser;
}