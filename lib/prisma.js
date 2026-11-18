import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "../config/settings.js";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
});

export const prisma = new PrismaClient({
  adapter,
});