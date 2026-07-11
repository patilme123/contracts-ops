import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.contractEvent.deleteMany(),
    prisma.contract.deleteMany(),
    prisma.organisationMember.deleteMany(),
    prisma.organisation.deleteMany()
  ]);

  console.log("Contract console data reset");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
