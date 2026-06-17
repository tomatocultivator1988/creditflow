import Decimal from "decimal.js";

export function roundToNearest10(value: Decimal): Decimal {
  const n = value.toNumber();
  return new Decimal(Math.round(n / 10) * 10);
}

export function computeLoan(
  principal: Decimal,
  interestRate: Decimal,
  termDays: number,
) {
  const interestAmount = principal
    .times(interestRate.div(100))
    .toDecimalPlaces(2);
  const totalPayable = principal.plus(interestAmount);
  const rawDaily = totalPayable.div(termDays);
  const dailyInstallment = roundToNearest10(rawDaily);
  return { interestAmount, totalPayable, dailyInstallment };
}
