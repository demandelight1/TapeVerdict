import { prisma } from "../lib/prisma.js";

async function main() {
  console.log("TapeVerdict Phase 1 Database Test");
  console.log("--------------------------------");

  const tables = await prisma.$queryRaw`
    SELECT tablename
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public'
  `;
  const tableNames = new Set(tables.map(({ tablename }) => tablename));
  const expectedTables = ["Site", "File", "Sign", "Scan", "MistakeReport"];
  const missingTables = expectedTables.filter((name) => !tableNames.has(name));

  if (missingTables.length > 0) {
    throw new Error(`Missing database tables: ${missingTables.join(", ")}`);
  }

  console.log(`Verified database tables: ${expectedTables.join(", ")}`);

  // Write a test record
  const created = await prisma.scan.create({
    data: {
      sitesChecked: 1,
      sitesChanged: 0,
      endedAt: new Date(),
      errors: {
        test: true,
        message: "Phase 1 database connectivity test",
      },
    },
  });

  console.log("\nRecord created:");
  console.log(created);

  // Read the record back
  const fetched = await prisma.scan.findUnique({
    where: {
      id: created.id,
    },
  });

  if (!fetched) {
    throw new Error("Database read-back failed");
  }

  console.log("\nRecord successfully retrieved:");
  console.log(JSON.stringify(fetched, null, 2));

  console.log("\nPHASE 1 DATABASE TEST PASSED");
}

main()
  .catch((error) => {
    console.error("PHASE 1 DATABASE TEST FAILED:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });