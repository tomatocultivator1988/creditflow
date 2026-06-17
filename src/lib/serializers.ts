import type { Prisma } from "@/generated/prisma/client";
import { dateToManilaDateOnly } from "@/lib/dates";
import { decimalToString } from "@/lib/money";

type LoanAccountShape = Prisma.LoanAccountGetPayload<Record<string, never>>;
type LoanScheduleShape = Prisma.LoanScheduleGetPayload<Record<string, never>>;
type PaymentShape = Prisma.PaymentGetPayload<Record<string, never>>;
type UserShape = Prisma.UserGetPayload<Record<string, never>>;

export function serializeLoanAccount(account: LoanAccountShape) {
  return {
    id: account.id,
    customerName: account.customerName,
    customerPhone: account.customerPhone,
    customerAddress: account.customerAddress,
    idNumber: account.idNumber ?? null,
    validIdType: account.validIdType ?? null,
    profilePicUrl: account.profilePicUrl ?? null,
    principal: decimalToString(account.principal),
    interestRate: decimalToString(account.interestRate),
    interestAmount: decimalToString(account.interestAmount),
    processingFee: decimalToString(account.processingFee),
    totalPayable: decimalToString(account.totalPayable),
    termDays: account.termDays,
    dailyInstallment: decimalToString(account.dailyInstallment),
    remainingBalance: decimalToString(account.remainingBalance),
    status: account.status,
    startDate: dateToManilaDateOnly(account.startDate),
    endDate: dateToManilaDateOnly(account.endDate),
    nextDueDate: dateToManilaDateOnly(account.nextDueDate),
    remarks: account.remarks ?? null,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

export function serializeLoanSchedule(schedule: LoanScheduleShape) {
  return {
    id: schedule.id,
    loanAccountId: schedule.loanAccountId,
    periodNumber: schedule.periodNumber,
    amount: decimalToString(schedule.amount),
    dueDate: dateToManilaDateOnly(schedule.dueDate),
    status: schedule.status,
    paidDate: schedule.paidDate ? dateToManilaDateOnly(schedule.paidDate) : null,
    paymentId: schedule.paymentId,
    paidAmount: schedule.paidAmount
      ? decimalToString(schedule.paidAmount)
      : null,
  };
}

export function serializePayment(payment: PaymentShape) {
  return {
    id: payment.id,
    loanAccountId: payment.loanAccountId,
    customerName: payment.customerName,
    amount: decimalToString(payment.amount),
    paymentDate: dateToManilaDateOnly(payment.paymentDate),
    notes: payment.notes,
    postedBy: payment.postedBy,
    createdAt: payment.createdAt.toISOString(),
  };
}

export function serializeUser(user: UserShape) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeAdminConfig(config: {
  id: string;
  defaultInterestRate: Prisma.Decimal;
  termOptions: number[];
  updatedAt: Date;
}) {
  return {
    id: config.id,
    defaultInterestRate: decimalToString(config.defaultInterestRate),
    termOptions: config.termOptions,
  };
}
