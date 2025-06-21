// disconnect.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$disconnect();
  console.log("Disconnected all Prisma connections.");
}

main();
