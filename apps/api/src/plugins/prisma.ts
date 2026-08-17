import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL as string;

const adapter = new PrismaPg({
  connectionString,
});

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

export const prisma = new PrismaClient({
  adapter,
});
