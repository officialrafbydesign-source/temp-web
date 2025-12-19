import 'dotenv/config';
import { PrismaClient } from "@prisma/client";

// Use default export to simplify imports
const prisma = new PrismaClient();
export default prisma;
