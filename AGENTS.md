# Cash Lending System — JBV Credit Collection Services

## DEV SERVER
Use `Start-Process -WindowStyle Normal -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd `"D:\CREDIT FLOW`"; npm run dev"` to launch.

---

## BUSINESS MODEL

**This is a cash lending system.** Daily installment collection, flat interest rate.

**Formula:**
```
interestAmount = principal × (interestRate / 100)
totalPayable = principal + interestAmount
dailyInstallment = totalPayable / termDays
```

**Example:** ₱10,000 principal, 5% interest, 30 days
- Interest = ₱500
- Total Payable = ₱10,500
- Daily = ₱350/day (last day absorbs rounding)

**Term options:** Configurable via `AdminConfig.termOptions` (default: 30, 60, 90, 120, 150, 180 days)

---

## KEY RULES

1. **Flat interest only** — not amortized, not monthly compound, not percentage-per-month
2. **No penalties** — no penalty computation, no penalty records, no late fees
3. **No discounts** — no advance payment discount
4. **Cash only** — no GCASH, no BANK payment methods
5. **No email sending** — keep `src/lib/email.ts` module but NEVER call it from account creation or payment posting
6. **Customer data is flat** on LoanAccount — no separate Customer table
7. **Schedule is daily** — one row per day of term
8. **Payment types** — NOT tracked (no REGULAR/PARTIAL/ADVANCE/FULL). Just record amount.

---

## TARGET PRISMA SCHEMA

**(Note: The schema below reflects the CURRENT production state including Capital, Expenses, and additional fields added after initial migration.)**

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Role {
  ADMIN
  COLLECTOR
}

enum LoanStatus {
  ACTIVE
  OVERDUE
  FULLY_PAID
}

enum ScheduleStatus {
  PENDING
  PAID
  OVERDUE
  PARTIAL
}

model User {
  id                  String                 @id @default(cuid())
  name                String
  email               String                 @unique
  password            String                 // bcrypt hashed
  role                Role                   @default(COLLECTOR)
  createdAt           DateTime               @default(now())
  updatedAt           DateTime               @updatedAt
  payments            Payment[]
  capitalTransactions CapitalTransaction[]
  postedExpenses      Expense[]
}

model LoanAccount {
  id               String         @id @default(cuid())
  // Customer (flat)
  customerName     String
  customerPhone    String
  customerEmail    String?        // Added: email for statement/customer records
  customerAddress  String
  fbLink           String?        // Added: Facebook profile link
  idNumber         String?
  validIdType      String?
  profilePicUrl    String?
  // Loan
  principal        Decimal        @db.Decimal(14, 2)
  interestRate     Decimal        @db.Decimal(5, 2)
  interestAmount   Decimal        @db.Decimal(14, 2)
  processingFee    Decimal        @default(0) @db.Decimal(14, 2)   // Added
  totalPayable     Decimal        @db.Decimal(14, 2)
  termDays         Int
  dailyInstallment Decimal        @db.Decimal(14, 2)
  remainingBalance Decimal        @db.Decimal(14, 2)
  status           LoanStatus     @default(ACTIVE)
  startDate        DateTime
  endDate          DateTime
  nextDueDate      DateTime
  remarks          String?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  // Relations
  payments         Payment[]
  schedule         LoanSchedule[]

  @@index([customerName])
  @@index([status])
  @@index([nextDueDate])
}

model LoanSchedule {
  id            String         @id @default(cuid())
  loanAccountId String
  periodNumber  Int
  dueDate       DateTime
  amount        Decimal        @db.Decimal(14, 2)
  status        ScheduleStatus @default(PENDING)
  paidDate      DateTime?
  paymentId     String?
  paidAmount    Decimal?       @db.Decimal(14, 2)
  loanAccount   LoanAccount    @relation(fields: [loanAccountId], references: [id])

  @@index([loanAccountId])
  @@index([dueDate])
  @@index([status])
  @@unique([loanAccountId, periodNumber])
}

model Payment {
  id            String         @id @default(cuid())
  loanAccountId String
  customerName  String
  amount        Decimal        @db.Decimal(14, 2)
  paymentDate   DateTime
  orNumber      String?        // Optional (was @unique but made nullable)
  notes         String?
  postedBy      String?
  createdAt     DateTime       @default(now())
  loanAccount   LoanAccount    @relation(fields: [loanAccountId], references: [id])
  postedByUser  User?          @relation(fields: [postedBy], references: [id])

  @@index([loanAccountId])
  @@index([paymentDate])
}

// Added: Capital tracking with automated balance
model CapitalTransaction {
  id            String   @id @default(cuid())
  type          String   // ADD | WITHDRAW | LOAN | COLLECTION | EXPENSE
  amount        Decimal  @db.Decimal(14, 2)
  balanceBefore Decimal  @db.Decimal(14, 2)
  balanceAfter  Decimal  @db.Decimal(14, 2)
  description   String?
  referenceId   String?  // loanId / paymentId / expenseId
  referenceType String?  // LOAN | PAYMENT | EXPENSE
  performedBy   String?
  createdAt     DateTime @default(now())
  performedByUser User?  @relation(fields: [performedBy], references: [id])

  @@index([type])
  @@index([createdAt])
}

// Added: Expense tracker (SALARY / OTHER with custom fields)
model Expense {
  id           String   @id @default(cuid())
  type         String   // SALARY | OTHER
  amount       Decimal  @db.Decimal(14, 2)
  description  String?
  date         DateTime
  customFields Json?    // Flexible key-value for OTHER category
  postedBy     String?
  createdAt    DateTime @default(now())
  postedByUser User?    @relation(fields: [postedBy], references: [id])

  @@index([type])
  @@index([date])
  @@index([createdAt])
}

model AdminConfig {
  id                  String   @id @default(cuid())
  defaultInterestRate Decimal  @default(5.00) @db.Decimal(5, 2)
  termOptions         Int[]    @default([30, 60, 90, 120, 150, 180])
  updatedAt           DateTime @updatedAt
}

model ActivityLog {
  id          String   @id @default(cuid())
  accountId   String
  action      String
  details     String?
  performedBy String?
  paymentId   String?
  createdAt   DateTime @default(now())

  @@index([accountId])
  @@index([createdAt])
}
```

**MIGRATION:** After writing schema, run:
```bash
npx prisma migrate dev --name cash_lending_init
```

---

## ENV VARIABLES (.env and .env.example)

```
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="generate-a-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
SUPABASE_STORAGE_URL="https://xxxxx.supabase.co/storage/v1"
SUPABASE_STORAGE_KEY="service_role_key_here"
```

Existing `.env` has old Supabase credentials — replace entirely with **new project** credentials.

---

## IMPLEMENTATION PHASES (Execute in Order)

---

### PHASE 1: CLEANUP & DEPENDENCIES

**1a. Delete these files/folders:**
- `e2e/` (entire folder)
- `server.log`
- `rename-enum.sql`
- `wqewqewqewqeqweqwewqeqwe.pdf`
- `GM-Cycle-User-Manual.pdf`
- `playwright.config.ts`

**1b. Remove .git folder:**
```bash
Remove-Item -Recurse -Force ".git"
```

**1c. Install new packages:**
```bash
npm install next-auth@beta bcryptjs @supabase/supabase-js
npm install --save-dev @types/bcryptjs
```

**1d. Remove unused packages:**
```bash
npm uninstall @vercel/blob @playwright/test png-to-ico
```

**1e. Rewrite `.env` and `.env.example`** with the template above.

**1f. Update `package.json`:**
- Remove `"test": "vitest run"` and `"test:watch": "vitest"` scripts
- Remove `@playwright/test`, `png-to-ico` from devDependencies if still present

---

### PHASE 2: PRISMA SCHEMA & MIGRATION

**2a. Rewrite `prisma/schema.prisma`** — replace entire file with the target schema above.

**2b. Delete old migrations folder:**
```bash
Remove-Item -Recurse -Force "prisma\migrations"
```

**2c. Run migration:**
```bash
npx prisma migrate dev --name cash_lending_init
```

**2d. Rewrite `prisma/seed.ts`:**
- Use `PrismaPg` adapter same as current
- Use `bcryptjs` to hash passwords
- Seed data:
  - 1 ADMIN user: email `admin@moneybee.com`, password `admin123`, role ADMIN
  - 1 COLLECTOR user: email `collector@moneybee.com`, password `collector123`, role COLLECTOR
  - 1 AdminConfig: defaultInterestRate=5.00, termOptions=[30,60,90,120,150,180]
  - 3-5 LoanAccounts across different statuses (ACTIVE, OVERDUE, FULLY_PAID)
  - For each ACTIVE/OVERDUE loan, generate daily LoanSchedule rows
  - A few Payments linked to loans

**Key seed computation:**
```typescript
function computeLoan(principal: Decimal, interestRate: Decimal, termDays: number) {
  const interestAmount = principal.times(interestRate.div(100)).toDecimalPlaces(2);
  const totalPayable = principal.plus(interestAmount);
  const dailyInstallment = totalPayable.div(termDays).toDecimalPlaces(2);
  return { interestAmount, totalPayable, dailyInstallment };
}
```

---

### PHASE 3: LIBRARY LAYER

**3a. DELETE these files:**
- `src/lib/penalty.ts`
- `src/lib/account-labels.ts`
- `src/lib/account-status.ts`
- `src/lib/form-validation.ts`
- `src/lib/field-validation.test.ts`
- `src/generated/prisma/` (will be regenerated)

**3b. CREATE `src/lib/loan-compute.ts`:**
```typescript
import Decimal from "decimal.js";

export function computeLoan(principal: Decimal, interestRate: Decimal, termDays: number) {
  const interestAmount = principal.times(interestRate.div(100)).toDecimalPlaces(2);
  const totalPayable = principal.plus(interestAmount);
  const rawDaily = totalPayable.div(termDays);
  const dailyInstallment = rawDaily.toDecimalPlaces(2, Decimal.ROUND_FLOOR);
  return { interestAmount, totalPayable, dailyInstallment };
}
```

**3c. REWRITE `src/lib/installment-schedule.ts`:**
- Rename export function from `generateSchedule` to `generateDailySchedule`
- Parameters: `(startDate: Date, termDays: number, dailyInstallment: Decimal, totalPayable: Decimal)`
- Generate `termDays` rows, one per day
- Each row: periodNumber=i, dueDate=startDate+i days, amount=dailyInstallment (last period absorbs rounding), status="PENDING"
- Remove `ScheduleType`, `dueDays`, `findClosestIndex`, `generateAdjustedDates`
- Use `addDays` from `date-fns`

```typescript
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
```

**3d. REWRITE `src/lib/serializers.ts`:**
New exports: `serializeLoanAccount`, `serializeLoanSchedule`, `serializePayment`, `serializeUser`, `serializeAdminConfig`

```typescript
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
    paidAmount: schedule.paidAmount ? decimalToString(schedule.paidAmount) : null,
  };
}

export function serializePayment(payment: PaymentShape) {
  return {
    id: payment.id,
    loanAccountId: payment.loanAccountId,
    customerName: payment.customerName,
    amount: decimalToString(payment.amount),
    paymentDate: dateToManilaDateOnly(payment.paymentDate),
    orNumber: payment.orNumber,
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

export function serializeAdminConfig(config: { id: string; defaultInterestRate: any; termOptions: number[]; updatedAt: Date }) {
  return {
    id: config.id,
    defaultInterestRate: decimalToString(config.defaultInterestRate),
    termOptions: config.termOptions,
  };
}
```

**3e. REWRITE `src/lib/validation.ts`:**
New schemas:

```typescript
import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required field");
const moneyString = z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount");
const dateOnlyString = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format");
const phoneString = z.string().trim().regex(/^\d{7,15}$/, "Phone must contain 7 to 15 digits only");
const nameString = z.string().trim().min(2, "Name is too short").max(120, "Name is too long")
  .regex(/^[\p{L}][\p{L}\s.'-]*$/u, "Name contains unsupported characters");

export const createLoanSchema = z.object({
  customerName: nameString,
  customerPhone: phoneString,
  customerAddress: requiredString,
  idNumber: z.string().optional(),
  validIdType: z.string().optional(),
  principal: moneyString,
  interestRate: moneyString,
  termDays: z.coerce.number().int().min(1, "Term must be at least 1 day").max(365, "Term cannot exceed 365 days"),
  startDate: dateOnlyString,
  remarks: z.string().optional(),
});

export const updateLoanSchema = z.object({
  customerName: nameString,
  customerPhone: phoneString,
  customerAddress: requiredString,
  idNumber: z.string().optional(),
  validIdType: z.string().optional(),
  remarks: z.string().optional(),
});

export const createPaymentSchema = z.object({
  loanAccountId: requiredString,
  amount: moneyString,
  paymentDate: dateOnlyString,
  orNumber: z.string().trim().min(1, "OR number is required"),
  notes: z.string().optional(),
});

export const updateAdminConfigSchema = z.object({
  defaultInterestRate: moneyString,
  termOptions: z.array(z.number().int().min(1).max(365)).min(1, "At least one term option required"),
});

export const createUserSchema = z.object({
  name: nameString,
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "COLLECTOR"]),
});
```

**3f. ADAPT `src/lib/balance.ts`:**
- Keep `recalculateBalance` function name
- Change model references: `installmentSchedule` → `loanSchedule`, `installmentAccount` → `loanAccount`
- Remove penalty logic (no `penaltyAmount` field on schedule)
- Remove `protectedStatuses` (CLOSED, APPLIED don't exist)
- Logic: sum unpaid schedule amounts (where status is PENDING/PARTIAL/OVERDUE and NOT PAID), determine status from balance + next due date

**3g. ADAPT `src/lib/schedule-status.ts`:**
- Keep `updateOverdueSchedule` function name
- Change model references: `installmentSchedule` → `loanSchedule`, `installmentAccountId` → `loanAccountId`
- Same logic preserved

**3h. CREATE `src/lib/auth.ts`:**
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
```

**3i. CREATE `src/lib/supabase-storage.ts`:**
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_STORAGE_URL!;
const supabaseKey = process.env.SUPABASE_STORAGE_KEY!;

export const supabaseStorage = createClient(supabaseUrl, supabaseKey);

export function getProfilePicUrl(path: string): string {
  return `${supabaseUrl}/object/public/profile-pics/${path}`;
}
```

**3j. CREATE `src/types/next-auth.d.ts`:**
```typescript
import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
```

**3k. REWRITE `src/types/api.ts`:**
Delete all old types. New types:

```typescript
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
  orNumber: string;
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
```

**3l. Run `npx prisma generate`** to regenerate the Prisma client.

---

### PHASE 4: AUTHENTICATION

**4a. CREATE `src/middleware.ts`:**
```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const adminOnly = ["/loans/new", "/admin", "/reports"];
const publicPaths = ["/login", "/api/auth"];

export default auth((req) => {
  const path = req.nextUrl.pathname;

  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = (req.auth.user as any)?.role;
  if (adminOnly.some((p) => path.startsWith(p)) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.ico$|manifest\\.webmanifest).*)"],
};
```

**4b. CREATE `src/app/api/auth/[...nextauth]/route.ts`:**
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

**4c. DELETE these auth files:**
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/components/auth-guard.tsx`

**4d. REWRITE `src/app/login/page.tsx`:**
- Use `"use client"`, `signIn` from `next-auth/react`
- Email input + password input
- On submit: `signIn("credentials", { email, password, redirect: false })` → on success `router.push("/dashboard")`
- Branding: "JBV Credit Collection Services" with logo, subtitle "Cash Lending System"
- Keep same visual styling (red-800 buttons, white card, rounded-2xl)

**4e. REWRITE `src/app/layout.tsx`:**
- Replace `<AuthGuard>` with `<SessionProvider>` from `next-auth/react`
- Update metadata title/description to "JBV Credit Collection Services" / "Cash Lending System"
- Keep `<AppShell>` wrap

**4f. MODIFY `src/components/logout-button.tsx`:**
- Replace fetch-based logout with `signOut` from `next-auth/react`

---

### PHASE 5: API ROUTES

**CONVENTION for all API routes:**
Use `import { auth } from "@/lib/auth"` and `const session = await auth()` at the top.
For admin-only routes, check `session?.user?.role !== "ADMIN"` and return 403.

**5a. DELETE these route directories:**
- `src/app/api/penalty-records/`
- `src/app/api/upload/`
- `src/app/api/installment-accounts/send-reminders/`
- `src/app/api/installment-accounts/reminders-preview/`
- `src/app/api/installment-accounts/[id]/apply-penalty/`
- `src/app/api/installment-accounts/[id]/bad-record/`
- `src/app/api/installment-accounts/[id]/adjust-due-dates/`
- `src/app/api/installment-accounts/[id]/device-security/`
- `src/app/api/installment-accounts/[id]/send-statement/`
- `src/app/api/installment-accounts/[id]/activate/`
- `src/app/api/installment-accounts/[id]/close/`
- `src/app/api/reports/gross-profit/`
- `src/app/api/reports/penalties/`
- `src/app/api/reports/account-master-list/`
- `src/app/api/payments/[id]/void/`

**5b. REWRITE loan routes (rename from installment-accounts):**
- `src/app/api/loans/route.ts` — GET (list with pagination+search), POST (create loan, ADMIN only)
- `src/app/api/loans/[id]/route.ts` — GET (detail), PUT (update info, ADMIN), DELETE (ADMIN)
- `src/app/api/loans/[id]/schedule/route.ts` — GET schedule
- `src/app/api/loans/[id]/payments/route.ts` — GET payments for loan

**5c. REWRITE `src/app/api/payments/route.ts`:**
- GET: list all payments with pagination. Access: all roles.
- POST: create payment. Access: ADMIN + COLLECTOR.
  - Parse `createPaymentSchema`
  - Validate loanAccountId exists and is not FULLY_PAID
  - Validate orNumber is unique
  - In transaction:
    - Create Payment record
    - Apply payment to unpaid schedule rows FIFO
    - Update loanAccount.remainingBalance
    - Update loanAccount.status based on new balance
  - DO NOT send email receipt

**5d. REWRITE `src/app/api/dashboard/route.ts`:**
Loan-adapted metrics:
- totalLoans, activeLoans, overdueLoans, fullyPaidLoans (groupBy status)
- totalPrincipal: SUM(LoanAccount.principal)
- totalInterest: SUM(LoanAccount.interestAmount)
- totalCollections: SUM(Payment.amount)
- outstandingBalances: SUM(remainingBalance WHERE status IN ACTIVE,OVERDUE)
- collectionsToday/ThisWeek/ThisMonth
- Aging: overdue loans bucketed by days

**5e. REWRITE `src/app/api/admin/config/route.ts`:**
- GET: return defaultInterestRate + termOptions. ADMIN only.
- PUT: update defaultInterestRate + termOptions. ADMIN only.

**5f. CREATE `src/app/api/admin/users/route.ts`:**
- GET: list all users. ADMIN only.
- POST: create user with bcrypt-hashed password. ADMIN only.

**5g. CREATE `src/app/api/loans/[id]/upload-photo/route.ts`:**
- POST: ADMIN only. Accept FormData with file. Upload to Supabase Storage bucket "profile-pics". Update profilePicUrl.

**5h. REWRITE report routes:**
- `src/app/api/reports/daily-collections/route.ts` — GET, ADMIN only
- `src/app/api/reports/monthly-collections/route.ts` — GET, ADMIN only
- `src/app/api/reports/outstanding-balances/route.ts` — GET, ADMIN only
- `src/app/api/reports/overdue-accounts/route.ts` — GET, ADMIN only
- DELETE `src/app/api/reports/collections/route.ts`

---

### PHASE 6: FRONTEND PAGES

**6a. DELETE these page directories:**
- `src/app/installment-accounts/` (entire tree)
- `src/app/payments/` (will rewrite)
- `src/app/reports/[slug]/` (will rewrite)
- `src/app/admin/config/` (will rewrite)

**6b. REWRITE `src/app/dashboard/dashboard-client.tsx`:**
- New metric cards for loan system
- Remove APPLIED, Bad Records, Unsecured Devices cards
- Keep same stat card component pattern

**6c. CREATE loan pages:**
- `src/app/loans/page.tsx` — list with search, status filter, New Loan button (ADMIN only)
- `src/app/loans/new/page.tsx` — create form with live computation preview. ADMIN only.
- `src/app/loans/[id]/page.tsx` — full detail with schedule timeline, payment history, photo upload

**6d. REWRITE payment pages:**
- `src/app/payments/page.tsx` — list all payments
- `src/app/payments/new/page.tsx` — form: select loan, amount, OR#, date, notes

**6e. REWRITE report pages:**
- `src/app/reports/page.tsx` — report hub
- `src/app/reports/daily-collections/page.tsx`
- `src/app/reports/monthly-collections/page.tsx`
- `src/app/reports/outstanding-balances/page.tsx`
- `src/app/reports/overdue-accounts/page.tsx`

**6f. REWRITE admin pages:**
- `src/app/admin/config/page.tsx` — interest rate + term options form
- `src/app/admin/users/page.tsx` — user list + create form (NEW)

---

### PHASE 7: COMPONENTS & SHELL

**7a. MODIFY `src/components/app-shell.tsx`:**
- Branding: "JBV Credit" / "Collection Services"
- Nav links: Dashboard, Loans, Payments (all) + Reports, Settings, Users (ADMIN only)
- Use `useSession` from `next-auth/react` for role check
- Mobile bottom nav matching

**7b. MODIFY `src/components/nav-link.tsx`:**
- Add `Landmark`, `Users` from lucide-react to iconMap

**7c. MODIFY `src/components/status-badge.tsx`:**
- LoanStatus: ACTIVE=green, OVERDUE=red, FULLY_PAID=gray
- Remove APPLIED, DUE_TODAY, CLOSED styles
- Keep ScheduleStatus styles

**7d. DELETE:**
- `src/components/install-prompt.tsx`
- `src/components/service-worker-register.tsx`

---

### PHASE 8: ROOT CONFIG & FINAL POLISH

**8a. Update `next.config.ts`:**
- Remove the service worker headers block

**8b. Update `vercel.json`:**
- Keep buildCommand: `npx prisma generate && next build`

**8c. Update `package.json` scripts:**
- Remove `"test"` and `"test:watch"` scripts

**8d. Verify:**
```bash
npx prisma generate
npm run lint
npm run build
```

**8e. Run seed:**
```bash
npm run db:seed
```

**8f. Manual verification:**
- Login as admin@moneybee.com / admin123 → full access
- Login as collector@moneybee.com / collector123 → limited access
- Admin sees all nav links; collector sees only Dashboard/Loans/Payments
- Dashboard loads with seeded data

---

## ROLE-BASED ACCESS SUMMARY

| Route | ADMIN | COLLECTOR |
|---|---|---|
| `/login` | Yes | Yes |
| `/dashboard` | Yes | Yes |
| `/loans` (list) | Yes | Yes |
| `/loans/[id]` (detail) | Yes | Yes |
| `/loans/[id]/statement` | Yes | Yes |
| `/loans/new` | Yes | **No** |
| `/payments` (list) | Yes | Yes |
| `/payments/new` | Yes | Yes |
| `/capital` | Yes | **No** |
| `/expenses` | Yes | **No** |
| `/reports/*` | Yes | **No** |
| `/admin/config` | Yes | **No** |
| `/admin/users` | Yes | **No** |

---

## SCHEMA ADDITIONS (Post-Initial Migration)

After the initial `cash_lending_init` migration, the following were added:

| Migration | Changes |
|---|---|
| `add_processing_fee` | Added `processingFee` to LoanAccount |
| `make_or_number_optional` | Made `orNumber` nullable, removed unique constraint |
| `add_capital_expenses` | Added `customerEmail`, `fbLink` to LoanAccount; Added `CapitalTransaction` and `Expense` models |

**CapitalTransaction types:** ADD, WITHDRAW, LOAN (auto on loan creation), COLLECTION (auto on payment), EXPENSE (auto on expense creation)

**Capital auto-tracking rules:**
- Loan created → CapitalTransaction(type: LOAN, deducts principal from balance)
- Payment received → CapitalTransaction(type: COLLECTION, adds amount to balance)
- Expense created → CapitalTransaction(type: EXPENSE, deducts amount from balance)
- Admin adds cash → CapitalTransaction(type: ADD)
- Admin withdraws → CapitalTransaction(type: WITHDRAW)
- Loan deleted → capital transaction records are cleaned up (reversed)

---

## FILES CHANGED SUMMARY

| Action | Count | Examples |
|---|---|---|
| DELETE | ~35 | e2e/, penalty lib, old auth, old API routes, old pages, PWA components, junk files |
| REWRITE | ~20 | schema, seed, serializers, validators, all API routes, all pages, types |
| CREATE | ~12 | auth.ts, loan-compute.ts, supabase-storage.ts, middleware.ts, [...nextauth] route, next-auth.d.ts, admin/users page, loans pages, payments/new, report pages |
| MODIFY | ~6 | app-shell, status-badge, nav-link, logout-button, layout, next.config |
| KEEP AS-IS | ~8 | prisma.ts, dates.ts, money.ts, errors.ts, api.ts, field-validation.ts, email.ts, client-api.ts |
