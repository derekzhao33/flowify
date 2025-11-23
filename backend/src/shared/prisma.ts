import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString: string = `${process.env.DATABASE_URL}`

const adapter: PrismaPg = new PrismaPg({connectionString});
const prisma: PrismaClient = new PrismaClient({ adapter });

export default prisma;