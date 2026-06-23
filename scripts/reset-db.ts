import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function reset() {
  console.log("Deleting all transactional data...\n");

  console.log("  ActivityLog...");
  const a = await prisma.activityLog.deleteMany();
  console.log(`    → ${a.count} rows deleted`);

  console.log("  CapitalTransaction...");
  const c = await prisma.capitalTransaction.deleteMany();
  console.log(`    → ${c.count} rows deleted`);

  console.log("  Expense...");
  const ex = await prisma.expense.deleteMany();
  console.log(`    → ${ex.count} rows deleted`);

  console.log("  LoanSchedule...");
  const s = await prisma.loanSchedule.deleteMany();
  console.log(`    → ${s.count} rows deleted`);

  console.log("  Payment...");
  const py = await prisma.payment.deleteMany();
  console.log(`    → ${py.count} rows deleted`);

  console.log("  LoanAccount...");
  const la = await prisma.loanAccount.deleteMany();
  console.log(`    → ${la.count} rows deleted`);

  console.log("\n✓ All transactional data deleted\n");

  const cfg = await prisma.adminConfig.findFirst();
  if (!cfg) {
    await prisma.adminConfig.create({
      data: {
        defaultInterestRate: 5.00,
        termOptions: [30, 60, 90, 120, 150, 180],
      },
    });
    console.log("✓ Default AdminConfig re-created\n");
  }

  const users = await prisma.user.count();
  console.log(`Users preserved: ${users}`);
  console.log("\nDatabase is ready for fresh data. Logins still work.");
}

reset()
  .catch((err) => {
    console.error("Reset failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
