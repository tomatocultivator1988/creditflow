import { config } from "dotenv";
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import Decimal from "decimal.js";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function roundToNearest10(value: Decimal): Decimal {
  return new Decimal(Math.round(value.toNumber() / 10) * 10);
}

function computeLoan(
  principal: Decimal,
  interestRate: Decimal,
  termDays: number,
) {
  const interestAmount = principal
    .times(interestRate.div(100))
    .toDecimalPlaces(2);
  const totalPayable = principal.plus(interestAmount);
  const dailyInstallment = roundToNearest10(totalPayable.div(termDays));
  return { interestAmount, totalPayable, dailyInstallment };
}

function generateSchedule(
  startDate: Date,
  termDays: number,
  dailyInstallment: Decimal,
  totalPayable: Decimal,
) {
  const schedule: Array<{
    periodNumber: number;
    dueDate: Date;
    amount: string;
    status: string;
  }> = [];
  let allocated = new Decimal(0);
  for (let i = 1; i <= termDays; i++) {
    const dueDate = addDays(startDate, i);
    let amount: Decimal;
    if (i === termDays) {
      amount = totalPayable.minus(allocated);
    } else {
      amount = dailyInstallment;
      allocated = allocated.plus(amount);
    }
    schedule.push({
      periodNumber: i,
      dueDate,
      amount: amount.toDecimalPlaces(2).toFixed(2),
      status: "PENDING",
    });
  }
  return schedule;
}

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.loanSchedule.deleteMany();
  await prisma.loanAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adminConfig.deleteMany();
  await prisma.activityLog.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const collectorPassword = await bcrypt.hash("collector123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@jbvcredit.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const collector = await prisma.user.create({
    data: {
      name: "Collector User",
      email: "collector@jbvcredit.com",
      password: collectorPassword,
      role: "COLLECTOR",
    },
  });

  console.log(`  ✓ Created admin: admin@jbvcredit.com / admin123`);
  console.log(`  ✓ Created collector: collector@jbvcredit.com / collector123`);

  // Create admin config
  const config = await prisma.adminConfig.create({
    data: {
      defaultInterestRate: new Decimal("5.00"),
      termOptions: [30, 60, 90, 120, 150, 180],
    },
  });
  console.log(`  ✓ Created admin config`);

  // Sample loans
  const startDate = new Date("2026-06-01T00:00:00.000+08:00");

  // Loan 1: ACTIVE — Juan Dela Cruz, 30 days
  const juan = await createLoan({
    customerName: "Juan Dela Cruz",
    customerPhone: "09171234567",
    customerAddress: "123 Rizal St., Manila",
    idNumber: "ID-12345",
    validIdType: "National ID",
    principal: new Decimal("10000"),
    interestRate: new Decimal("5.00"),
    processingFee: new Decimal("500"),
    termDays: 30,
    startDate,
    status: "ACTIVE",
    payPeriods: 5,
  });

  // Loan 2: OVERDUE — Maria Santos, 60 days
  const mariaStart = new Date("2026-05-01T00:00:00.000+08:00");
  const maria = await createLoan({
    customerName: "Maria Santos",
    customerPhone: "09189876543",
    customerAddress: "456 Mabini St., Quezon City",
    idNumber: "ID-67890",
    validIdType: "Driver's License",
    principal: new Decimal("15000"),
    interestRate: new Decimal("5.00"),
    processingFee: new Decimal("500"),
    termDays: 60,
    startDate: mariaStart,
    status: "OVERDUE",
    payPeriods: 10,
  });

  // Loan 3: ACTIVE — Pedro Reyes, 90 days
  const pedroStart = new Date("2026-05-15T00:00:00.000+08:00");
  const pedro = await createLoan({
    customerName: "Pedro Reyes",
    customerPhone: "09221234567",
    customerAddress: "789 Aguinaldo St., Makati",
    idNumber: "ID-11111",
    validIdType: "Passport",
    principal: new Decimal("20000"),
    interestRate: new Decimal("4.50"),
    processingFee: new Decimal("1000"),
    termDays: 90,
    startDate: pedroStart,
    status: "ACTIVE",
    payPeriods: 20,
  });

  // Loan 4: FULLY_PAID — Ana Lopez, 30 days
  const anaStart = new Date("2026-04-01T00:00:00.000+08:00");
  const ana = await createLoan({
    customerName: "Ana Lopez",
    customerPhone: "09331234567",
    customerAddress: "321 Bonifacio St., Pasig",
    idNumber: "ID-22222",
    validIdType: "UMID",
    principal: new Decimal("8000"),
    interestRate: new Decimal("5.00"),
    processingFee: new Decimal("300"),
    termDays: 30,
    startDate: anaStart,
    status: "FULLY_PAID",
    payPeriods: 30,
    fullyPaid: true,
  });

  // Loan 5: OVERDUE — Carlos Cruz, 30 days
  const carlosStart = new Date("2026-04-15T00:00:00.000+08:00");
  const carlos = await createLoan({
    customerName: "Carlos Cruz",
    customerPhone: "09451234567",
    customerAddress: "654 Luna St., Taguig",
    idNumber: "ID-33333",
    validIdType: "SSS ID",
    principal: new Decimal("12000"),
    interestRate: new Decimal("5.00"),
    processingFee: new Decimal("500"),
    termDays: 30,
    startDate: carlosStart,
    status: "OVERDUE",
    payPeriods: 5,
  });

  // Post some payments
  // For Juan (ACTIVE) — pay 5 periods
  const juanSchedule = await prisma.loanSchedule.findMany({
    where: { loanAccountId: juan.id },
    orderBy: { periodNumber: "asc" },
    take: 5,
  });
  for (const s of juanSchedule) {
    await postPayment(juan.id, juan.customerName, new Decimal(s.amount), s.periodNumber, admin.id);
  }

  // For Maria (OVERDUE) — pay 10 periods out of 60
  const mariaSchedule = await prisma.loanSchedule.findMany({
    where: { loanAccountId: maria.id },
    orderBy: { periodNumber: "asc" },
    take: 10,
  });
  for (const s of mariaSchedule) {
    await postPayment(maria.id, maria.customerName, new Decimal(s.amount), s.periodNumber, collector.id);
  }

  // For Ana (FULLY_PAID) — pay all periods
  const anaSchedule = await prisma.loanSchedule.findMany({
    where: { loanAccountId: ana.id },
    orderBy: { periodNumber: "asc" },
  });
  for (const s of anaSchedule) {
    await postPayment(ana.id, ana.customerName, new Decimal(s.amount), s.periodNumber, admin.id);
  }

  // For Carlos (OVERDUE) — pay 5 periods out of 30
  const carlosSchedule = await prisma.loanSchedule.findMany({
    where: { loanAccountId: carlos.id },
    orderBy: { periodNumber: "asc" },
    take: 5,
  });
  for (const s of carlosSchedule) {
    await postPayment(carlos.id, carlos.customerName, new Decimal(s.amount), s.periodNumber, collector.id);
  }

  console.log(`\n✓ Seeding complete!`);
  console.log(`\nCredentials:`);
  console.log(`  Admin:     admin@jbvcredit.com / admin123`);
  console.log(`  Collector: collector@jbvcredit.com / collector123`);
}

async function createLoan(params: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  idNumber: string;
  validIdType: string;
  principal: Decimal;
  interestRate: Decimal;
  processingFee: Decimal;
  termDays: number;
  startDate: Date;
  status: string;
  payPeriods: number;
  fullyPaid?: boolean;
}) {
  const { interestAmount, totalPayable, dailyInstallment } = computeLoan(
    params.principal,
    params.interestRate,
    params.termDays,
  );

  const schedule = generateSchedule(
    params.startDate,
    params.termDays,
    dailyInstallment,
    totalPayable,
  );

  const endDate = addDays(params.startDate, params.termDays);
  const nextDueDate = schedule[0]?.dueDate ?? params.startDate;

  const account = await prisma.loanAccount.create({
    data: {
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerAddress: params.customerAddress,
      idNumber: params.idNumber,
      validIdType: params.validIdType,
      principal: params.principal.toFixed(2),
      interestRate: params.interestRate.toFixed(2),
      interestAmount: interestAmount.toFixed(2),
      processingFee: params.processingFee.toFixed(2),
      totalPayable: totalPayable.toFixed(2),
      termDays: params.termDays,
      dailyInstallment: dailyInstallment.toFixed(2),
      remainingBalance: totalPayable.toFixed(2),
      status: params.fullyPaid ? "FULLY_PAID" : (params.status as any),
      startDate: params.startDate,
      endDate,
      nextDueDate,
      schedule: {
        create: schedule.map((s) => ({
          periodNumber: s.periodNumber,
          dueDate: s.dueDate,
          amount: s.amount,
          status: "PENDING" as any,
        })),
      },
    },
  });

  return account;
}

async function postPayment(
  loanAccountId: string,
  customerName: string,
  amount: Decimal,
  periodNumber: number,
  userId: string,
) {
  const orNumber = `OR-${Date.now()}-${periodNumber}`;
  const paymentDate = new Date();

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        loanAccountId,
        customerName,
        amount: amount.toFixed(2),
        paymentDate,
        orNumber,
        notes: `Payment for period ${periodNumber}`,
        postedBy: userId,
      },
    });

    await tx.loanSchedule.updateMany({
      where: {
        loanAccountId,
        periodNumber,
      },
      data: {
        status: "PAID",
        paidDate: paymentDate,
        paymentId: payment.id,
        paidAmount: amount.toFixed(2),
      },
    });

    // Update remaining balance
    const unpaid = await tx.loanSchedule.findMany({
      where: {
        loanAccountId,
        status: { not: "PAID" },
      },
    });

    const remaining = unpaid.reduce(
      (sum, s) => sum.plus(new Decimal(s.amount).minus(s.paidAmount ? new Decimal(s.paidAmount) : new Decimal(0))),
      new Decimal(0),
    );

    const status = remaining.isZero() ? "FULLY_PAID" : undefined;

    await tx.loanAccount.update({
      where: { id: loanAccountId },
      data: {
        remainingBalance: remaining.toFixed(2),
        ...(status ? { status: status as any } : {}),
      },
    });
  });
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
