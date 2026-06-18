import Decimal from "decimal.js";

export function computeLoan(
  principal: Decimal,
  interestRate: Decimal,
  termDays: number,
) {
  if (termDays <= 0) {
    throw new Error("Term days must be positive");
  }
  const interestAmount = principal
    .times(interestRate.div(100))
    .toDecimalPlaces(2);
  const totalPayable = principal.plus(interestAmount);
  const rawDaily = totalPayable.div(termDays);
  const dailyInstallment = rawDaily.toDecimalPlaces(2, Decimal.ROUND_FLOOR);
  return { interestAmount, totalPayable, dailyInstallment };
}
