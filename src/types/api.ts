export type LoanStatusValue = "ACTIVE" | "OVERDUE" | "FULLY_PAID";
export type ScheduleStatusValue = "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
export type RoleValue = "ADMIN" | "COLLECTOR";

export type LoanAccountDto = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string;
  fbLink: string | null;
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
  nextDueDate: string | null;
  remarks: string | null;
  released: boolean;
  releasedAt: string | null;
  releasedBy: string | null;
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

export type CapitalTransactionDto = {
  id: string;
  type: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string | null;
  referenceId: string | null;
  referenceType: string | null;
  performedBy: string | null;
  createdAt: string;
};

export type ExpenseDto = {
  id: string;
  type: string;
  amount: string;
  description: string | null;
  date: string;
  customFields: Record<string, string> | null;
  postedBy: string | null;
  createdAt: string;
};

export type DueTodayItemDto = {
  loanAccountId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  dailyInstallment: string;
  remainingBalance: string;
  periodNumber: number;
  amount: string;
  dueDate: string;
  status: ScheduleStatusValue;
  paidAmount: string | null;
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
  capitalBalance: string;
  totalExpenses: string;
  salaryExpenses: string;
  otherExpenses: string;
  aging: {
    current: number;
    days1to30: number;
    days31to60: number;
    days61to90: number;
    days90plus: number;
  };
  dueToday: DueTodayItemDto[];
  dueTodayTotal: string;
  dueTodayCount: number;
};
