import Decimal from "decimal.js";
import { addDays } from "date-fns";

export type LoanScheduleInput = {
  periodNumber: number;
  dueDate: Date;
  amount: Decimal;
  status: "PENDING";
};

export function generateDailySchedule(
  startDate: Date,
  termDays: number,
  dailyInstallment: Decimal,
  totalPayable: Decimal,
): LoanScheduleInput[] {
  const schedule: LoanScheduleInput[] = [];
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
      amount: amount.toDecimalPlaces(2),
      status: "PENDING",
    });
  }
  return schedule;
}
