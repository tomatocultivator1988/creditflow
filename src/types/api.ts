export type LoanStatusValue = "ACTIVE" | "OVERDUE" | "FULLY_PAID";
export type ScheduleStatusValue = "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
export type RoleValue = "ADMIN" | "COLLECTOR";

export type LoanAccountDto = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  idNumber: string | null;
  validIdType: string | null;
  profilePicUrl: string | null;
  principal: string;
  interestRate: string;
  interestAmount: string;
  processingFee: string;
  totalPayable: string;
  termDays: number;
  dailyInstallment: string;
  remainingBalance: string;
  status: LoanStatusValue;
  startDate: string;
  endDate: string;
  nextDueDate: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoanScheduleDto = {
  id: string;
  loanAccountId: string;
  periodNumber: number;
  amount: string;
  dueDate: string;
  status: ScheduleStatusValue;
  paidDate: string | null;
  paymentId: string | null;
  paidAmount: string | null;
};

export type PaymentDto = {
  id: string;
  loanAccountId: string;
  customerName: string;
  amount: string;
  paymentDate: string;
  notes: string | null;
  postedBy: string | null;
  createdAt: string;
};

export type UserDto = {
  id: string;
  name: string;
  email: string;
  role: RoleValue;
  createdAt: string;
};

export type AdminConfigDto = {
  id: string;
  defaultInterestRate: string;
  termOptions: number[];
};

export type DashboardMetricsDto = {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  fullyPaidLoans: number;
  totalPrincipal: string;
  totalInterest: string;
  totalCollections: string;
  outstandingBalances: string;
  collectionsToday: string;
  collectionsThisWeek: string;
  collectionsThisMonth: string;
  aging: {
    current: number;
    days1to30: number;
    days31to60: number;
    days61to90: number;
    days90plus: number;
  };
};
