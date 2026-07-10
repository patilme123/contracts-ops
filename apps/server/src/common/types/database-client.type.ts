import { prisma, type Prisma } from "@contract-console/database";

export type DatabaseClient = typeof prisma | Prisma.TransactionClient;
