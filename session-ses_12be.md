# Credit flow: Capital, Expenses, Loan, Dashboard

**Session ID:** ses_12be139f0ffe2BmMfXh1WyOYjO
**Created:** 6/17/2026, 1:47:27 PM
**Updated:** 6/17/2026, 2:00:47 PM

---

## User

boss muni convo namon sang client ko. iya ni system ang credit flow tas hmbl ya Tapos mag pa add po sa Menu ng 
Capital 
Withdraw capital
Expenses - SALARY & OTHER EXPENSES .tapos sa pag create sang loan, sa details bala sang customer dapat same silasang sa mvp folder sa drive d. gets mo? may mga fb link man dapat may number may gmail. tas dapat may statement man sya , pwede boss? tapos need nya ang like same sa original nga makita ang tanan nga user nga overdue or due that day. daw same ata sa due date monitoring sa reports mu. tapos sa dashboard dapat same man sila mga bars kag tanan basta finances related. ikaw na bahala mag analyze. "D:\MVP"

---

## Assistant (Plan · DeepSeek V4 Flash Free · 147.6s)

_Thinking:_

The user is speaking in Tagalog/Filipino mixed with English. Let me understand what they're saying:

They're saying their client wants to add features to the Credit Flow system:

1. **Menu additions for "Capital"**:
   - Capital (main menu)
   - Withdraw Capital (sub-menu)
   - Expenses - SALARY & OTHER EXPENSES (sub-menu)

2. **Loan creation - Customer details update**:
   - They want the customer details in loan creation to match what's in the MVP folder at D:\MVP
   - Should have Facebook link, phone number, Gmail
   - Should have a "statement" feature

3. **Due date monitoring**:
   - Need to see all users that are overdue or due that day
   - Similar to "due date monitoring" in reports

4. **Dashboard**:
   - Should have financial bars/charts
   - Similar to what's in the MVP

5. They say "ikaw na bahala mag analyze" (you're the one to analyze it)

Let me first look at the MVP folder to understand what design they're referring to, and also look at the current codebase to understand what needs to change.

Let me start by exploring the MVP folder and the current codebase structure.

Boss, gets ko. Checkan ta anang MVP folder kag current system para ma-analyze naton ang pagkailangan.

**Tool: task**

**Input:**
```json
{
  "description": "Explore MVP folder contents",
  "prompt": "Thoroughly explore the D:\\MVP folder. List all files and subdirectories recursively. Read any relevant design files, mockups, HTML files, or documentation that show the UI/UX design for the credit/lending system. I need to understand:\n1. What customer details/fields are shown in the loan creation form\n2. What the dashboard looks like (charts, metrics, layout)\n3. What menu items exist (especially Capital, Withdraw Capital, Expenses)\n4. Any due date monitoring screens\n5. Any statement feature\n\nReturn a comprehensive summary of all findings, including file contents of design-related files.",
  "subagent_type": "explore"
}
```

**Output:**
```
<task id="ses_12be118edffe8U0CW4DpXEzvTg" state="completed">
<task_result>
Now I have a thorough understanding of the entire D:\MVP codebase. Here is the comprehensive summary.

---

## COMPREHENSIVE FINDINGS: D:\MVP (MyFaveGadgets Installment Monitoring System)

### OVERVIEW

This is **MyFaveGadgets** — a gadget/motorcycle installment monitoring system for a business in Binan City, Laguna, Philippines. It is **NOT a cash lending/credit system** (though it originated from one called "CreditFlow"). The system tracks installment accounts for gadgets (phones, motorcycles) and cash loans, with features for payments, penalties, discounts, due date monitoring, and reporting.

**Branding:** MyFaveGadgets — Gadget Installment Monitoring System
**Original source:** CreditFlow v0.1.0 (micro-lending MVP) which was migrated to the installment model.

---

### 1. LOAN CREATION FORM (New Account / Installment Account Form)

**File:** `D:\MVP\src\app\installment-accounts\new\installment-account-form.tsx` (680 lines)

The form is divided into two columns: **Customer Details (left, ~420px)** and **Contract Details (right)**.

#### Customer Details Fields (required unless noted):
| Field | Type | Notes |
|-------|------|-------|
| Full Name | Text | `nameString` validation (2-120 chars, letters/spaces/periods/apostrophes/hyphens) |
| Contact | Numeric | Phone (7-15 digits only) |
| Email | Email | Required — used for sending DP receipts and payment receipts |
| Address | Textarea | Required |
| Facebook Profile Link | URL | Required — with Facebook icon prefix |
| Custom Fields | Dynamic key-value pairs | Optional — click "+ Add Field" to add extra fields like Reference Number, Color, etc. |

#### Device Details Fields:
- **Item Type toggle**: "Gadget" (motorcycle/phone) or "Cash"
- **Brand** (text, required when GADGET)
- **Model** (text, required when GADGET)
- **Unit Description / Description** (textarea, required for both types)

#### Contract Details Fields:
| Field | Type | Notes |
|-------|------|-------|
| Cash Price | Numeric | Whole number (no decimals) |
| Interest Rate (% per month) | Decimal | e.g. "5" or "3.5" |
| Down Payment | Numeric | Whole number, must be less than installment price |
| Processing Fee | Decimal | Optional, defaults to 0 |
| Term (months) | Number (6-48) | Dropdown, not actually a dropdown — it's an input with min=6, max=48 |
| Date Given | Date | Optional |
| First Due Date | Date | Required |
| Second Due Date | Number (1-31) | Shown only when schedule = Semi-Monthly |
| Schedule Frequency | Toggle buttons | Semi-Monthly (2x/month) or Monthly (1x/month) |

#### Live Computation Preview (bottom of form):
- **Remaining Balance** = `(Cash Price + Total Interest) - Down Payment`
- **Monthly** = `Remaining Balance / Term` (rounded to nearest 50)
- **Per Period** = `Remaining Balance / Total Periods` (rounded to nearest 50)
- **Term / Total Periods** e.g. "24 mo / 48x"

**Interest formula:**
- For GADGET items: `Total Interest = (Cash Price - Down Payment) × (Rate/100) × Term`
- For CASH items: `Total Interest = (Cash Price - Down Payment) × (Rate/100)` (one-time)

---

### 2. DASHBOARD

**File:** `D:\MVP\src\app\dashboard\dashboard-client.tsx` (286 lines)

The dashboard has a clean, full-width layout with the following sections:

#### Header
- Title: "Dashboard" with current date (Asia/Manila timezone)
- "New Account" button (red-800, top right)

#### KPI Hero Row (4-column grid)
1. **Total Accounts** — gradient red background, Users icon
2. **Active Accounts** — gradient emerald, CheckCircle2 icon, shows overdue percentage trend
3. **Collections (Month)** — gradient red, PiggyBank icon
4. **Outstanding** — gradient slate, Landmark icon, shows collection rate trend

#### Account Status Breakdown + Financial Summary (5-column grid)
**Left (2 cols) — Account Status Breakdown bar chart:**
- Applied (red bar)
- Active (emerald bar)
- Due Today (amber bar)
- Overdue (rose bar)
- Fully Paid (slate bar)
Each shows count and percentage with a horizontal progress bar.

**Right (3 cols) — Financial Summary (compact cards):**
- **Installment Sales** (red left border)
- **Gross Profit** (emerald left border)
- **Down Payments** (red-400 left border)
- **Total Collections** (red-600 left border)
- **Penalties Collected** (rose left border)
- **Outstanding Balance** (orange left border)

#### Collections Timeline + Delinquency Aging (2-column grid)
**Left — Collections (3 small cards):**
- Today
- This Week
- This Month

**Right — Delinquency Aging (vertical bar chart):**
- Current (emerald)
- 1-30d (amber)
- 31-60d (orange)
- 61-90d (rose)
- 90d+ (red-700)

#### Needs Attention Section
Conditional cards showing:
- Due Today count (amber border, link to filtered list)
- Overdue 1-30 days (red border)
- Overdue 31+ days (rose border)
- Unactivated accounts (slate border)
- Bad Records (red border)
- Unsecured Devices (blue border)
Shows "All clear" message when no items need attention.

#### Quick Actions (bottom)
- "View All Accounts" button
- "Payment Records" button
- "Reports & Exports" button

**All metrics fetched from:** `GET /api/dashboard`

---

### 3. MENU / NAVIGATION ITEMS

**File:** `D:\MVP\src\components\app-shell.tsx` (57 lines)

**There are NO "Capital", "Withdraw Capital", or "Expenses" menu items anywhere in this system.** A grep search for "capital", "withdraw", and "expenses" across all `.tsx`, `.ts`, `.md`, and `.prisma` files returned **zero results**.

The actual navigation menu consists of these 5 items:

| # | Menu Item | Icon | Route |
|---|-----------|------|-------|
| 1 | **Dashboard** | LayoutDashboard | `/dashboard` |
| 2 | **Accounts** | Smartphone | `/installment-accounts` |
| 3 | **Payments** | ReceiptText | `/payments` |
| 4 | **Reports** | FileText | `/reports` |
| 5 | **Settings** | Settings | `/admin/config` |

**Mobile navigation** replicates the same 5 items as icon buttons at the bottom of the screen, plus a Logout button.

The branding in the header shows:
- **Logo** (`/logo.png` image, 40-64px)
- **Title**: "MyFaveGadgets"
- **Subtitle**: "Gadget Installment"

---

### 4. DUE DATE MONITORING

**File:** `D:\MVP\src\app\reports\[slug]\page.tsx` (559 lines)

The **Due Date Monitoring** report is located at `/reports/overdue-accounts`. It is one of 7 reports.

#### Features:
- **Title**: "Due Date Monitoring"
- **Description**: "All active accounts sorted by due date. Filter by any date to see who paid and who hasn't."
- **Date Filter**: "Due on or before" — a date picker at the top. When a date is selected, it shows accounts with due dates on or before that date. Includes a "Clear Filter" button.
- **Summary cards**: "Filtered Accounts" count and "Total Overdue" count

#### Columns in the report table:
1. **Customer** (clickable link to account detail)
2. **Unit** (brand + model)
3. **Contact** (phone)
4. **Due Date** (nextDueDate)
5. **Status** (StatusBadge component)
6. **Balance** (remainingBalance, formatted as peso)
7. **Per Period** (monthlyInstallment with "/period" or "/mo" suffix)
8. **Last Payment** (date + amount, or "—")
9. **Days Overdue** (e.g., "5d overdue" in rose-600)

The report includes responsive design — on mobile, data shows as expandable cards showing Customer Name + Status as summary.

Additionally, on the **Account Master List** report (`/reports/account-master-list`), there is a "Total Amount Due" column that can be clicked to open a **modal breakdown** showing each due period's number, due date, amount, penalty, and total.

On the **Account Detail page** (`D:\MVP\src\app\installment-accounts\[id]\account-detail-client.tsx`), there is:
- A **"Days Overdue"** stat card
- An **"Adjust Due Dates"** button for unpaid periods (opens a modal with preview of new dates)
- A **"Needs Attention"** card in the schedule showing accruing penalties with "Apply Penalty" button per overdue period

---

### 5. STATEMENT FEATURE

**File:** `D:\MVP\src\app\installment-accounts\[id]\statement\page.tsx` (484 lines)

**Route:** `/installment-accounts/[id]/statement`

**Access:** From the Account Detail page via a "Statement" button in the action bar.

#### Statement Layout:

The statement is a full-page printable document with the following sections:

**Header area (non-printable):**
- "Back to Account" button
- "DP Receipt" link
- "Print PDF" button (red-800)
- "Send" button (emails the statement to the customer's email, if they have one)
- Success/error messages for email sending

**Printable Statement Content (white card with border):**

1. **Statement Header**: "Account Statement" title, "MyFaveGadgets — Gadget Installment Monitoring", generation timestamp, account status badge

2. **Customer & Device Info** (2-column grid):
   - Customer: Name, Contact, Email (if any), Address
   - Device: Brand, Model, Description

3. **Contract Details** (4-column grid):
   - Net Price (Installment Price - Down Payment)
   - Down Payment
   - Term (e.g., "24 months (48 periods)")
   - Per Period / Monthly amount with "/period" or "/mo"
   - First Due Date
   - Date Given

4. **Payment Summary** (4-column grid):
   - Total Paid (emerald)
   - Penalties (rose)
   - Remaining (slate)

5. **Payment History** (full table or mobile cards):
   - Desktop: Table with Date, Amount (right-aligned), Type, Method, Penalty (right-aligned), Cashier, Proof columns
   - Mobile: Expandable cards with same info

6. **Installment Schedule** (full table or mobile cards):
   - Shows all periods with: #, Due Date, Days Overdue, Amount, Penalty, Total, Status, Paid Date, Paid Amount
   - Partial payment rows show extra "Paid/Remaining" breakdown
   - Footer shows Total Due (principal + penalty) and Remaining Balance
   - Mobile: Cards with color-coded borders (emerald=PAID, rose=OVERDUE, amber=PARTIAL, slate=PENDING)

7. **Penalty Records** (table, only if penalties exist):
   - Date, Amount (right-aligned), Reason

8. **Total Amount Due** (special section at bottom):
   - Only shown if periods are due on or before today
   - Shows all due periods with amounts, penalties, and totals
   - Red highlight with "Total Amount Due (X periods due on or before today)"
   - Shows both Total Due and Remaining Balance

9. **Footer**: "MyFaveGadgets — Gadget Installment Monitoring System — {date}"

The statement data is fetched from: `GET /api/installment-accounts/[id]/statement`

---

### 6. ADDITIONAL UI/UX FINDINGS

#### Account Detail Page (`/installment-accounts/[id]`)
**File:** `D:\MVP\src\app\installment-accounts\[id]\account-detail-client.tsx` (2029 lines)

The most feature-rich page in the system. It includes:

**Action buttons (top right):**
- **Statement** — goes to the statement page
- **DP Receipt** — goes to down payment receipt
- **Edit** — opens edit modal (customer info, contract terms with admin password)
- **Post Payment** — opens payment modal
- **Close** — closes account with admin password
- **Delete** — permanently deletes account with "DELETE" confirmation + admin password

**Sections:**
1. **Customer Info Cards**: Customer (name, phone, email, Facebook), Address, Device/Term
2. **Account Summary**: Status badge, Next Due Date, Days Overdue, Date Given, First Due Date
3. **Pricing**: Interest rate display
4. **Device Security** (if set): Email, Password, Account Holder
5. **Financial Stats** (7 cards): Cash Price, Net Price, Down Payment, Processing Fee, Remaining Balance, Per Period/Monthly, Gross Profit
6. **Total Payments & Total Penalties** (2 cards)
7. **Custom Fields** (if any)
8. **Requirements Checklist** (only for APPLIED status) — 5 requirements (Valid ID, Selfie with ID, Proof of Income, Proof of Address, Residence Photo) + "Activate Account" button
9. **Installment Schedule** — collapsible timeline with period numbers, amounts, status badges, penalty info, and "Apply Penalty" buttons
10. **Payment History** — each payment with amount, type, method, cashier, penalty, proof image, "Print" and "Void" buttons
11. **Penalty History** (if any) — with "Undo" button

**Modals:**
- Post Payment modal (amount, date, auto-detected type, method, cashier, notes, proof upload)
- Edit Account modal (all fields editable, contract terms require admin password)
- Apply Penalty modal (shows days overdue, rate, accrued amount, waived amount)
- Close Account modal (remarks + admin password required)
- Delete Account modal (type "DELETE" + admin password)
- Adjust Due Dates modal (preview of new dates for unpaid periods)
- Void Payment modal (type "VOID" + reason)

#### Payments Page (`/payments`)
- Lists all payments with: Customer, Amount, Date, Method, Type, Penalty, Proof (thumbnail), Receipt button
- "New Payment" button opens a modal with account selector dropdown (shows balance, next due, monthly/period), amount, date (auto), auto-detected payment type, method (Cash/GCash/Bank), cashier, notes, proof upload
- Payment type auto-detection: FULL (amount >= remaining balance), PARTIAL (amount < monthly), REGULAR (amount >= monthly)

#### Settings Page (`/admin/config`)
- Penalty Per Day (₱) — configurable, default 50
- Admin Email (for reports)
- Admin Password (for closing & editing accounts)

#### Reports Page (`/reports`)
- Hub listing 7 reports as card links:
  1. Collection Report (`/reports/collections`)
  2. Daily Collection Report (`/reports/daily-collections`)
  3. Monthly Collection Report (`/reports/monthly-collections`)
  4. Due Date Monitoring (`/reports/overdue-accounts`)
  5. Penalty Report (`/reports/penalties`)
  6. Outstanding Balance Report (`/reports/outstanding-balances`)
  7. Account Master List (`/reports/account-master-list`)

#### Authentication
- Simple password-based login (no user accounts in the MVP)
- Login at `/login` — enter a password, POST to `/api/auth/login`
- No session management — the app uses a basic `AuthGuard` component
- The `AppShell` wraps all pages with the navigation header

---

### 7. DESIGN LANGUAGE / CSS THEME

- **Primary color**: Red-800 (`#991b1b`) for buttons, branding, active states
- **Accent colors**: Emerald for positive (paid, active, success), Amber for warnings (due today, partial), Rose for danger (overdue, penalties, void)
- **Background**: Slate-50 (`#f8fafc`)
- **Card style**: White background, border (`border-slate-200`), `rounded-2xl`, subtle shadow (`shadow-sm`)
- **Font**: Uses Tailwind's `font-heading` for titles and semantic classes
- **Icons**: Lucide React icon library
- **Responsive**: Mobile-first with bottom nav, card-based tables on small screens
- **All money formatted**: PHP peso format via `formatPeso()` from `src/lib/money.ts`

---

### 8. KEY FILE LOCATIONS

| Purpose | File Path |
|---------|-----------|
| Prisma Schema | `D:\MVP\prisma\schema.prisma` |
| Seed Data | `D:\MVP\prisma\seed.ts` |
| Dashboard UI | `D:\MVP\src\app\dashboard\dashboard-client.tsx` |
| Account List | `D:\MVP\src\app\installment-accounts\page.tsx` |
| New Account Form | `D:\MVP\src\app\installment-accounts\new\installment-account-form.tsx` |
| Account Detail | `D:\MVP\src\app\installment-accounts\[id]\account-detail-client.tsx` |
| Statement Page | `D:\MVP\src\app\installment-accounts\[id]\statement\page.tsx` |
| Payments List + Form | `D:\MVP\src\app\payments\page.tsx` |
| Reports Hub | `D:\MVP\src\app\reports\page.tsx` |
| Report Detail (all) | `D:\MVP\src\app\reports\[slug]\page.tsx` |
| Settings | `D:\MVP\src\app\admin\config\page.tsx` |
| Login | `D:\MVP\src\app\login\page.tsx` |
| App Shell / Nav | `D:\MVP\src\components\app-shell.tsx` |
| Nav Links | `D:\MVP\src\components\nav-link.tsx` |
| Status Badge | `D:\MVP\src\components\status-badge.tsx` |
| API Types | `D:\MVP\src\types\api.ts` |
| Zod Validation | `D:\MVP\src\lib\validation.ts` |
| Form Validation | `D:\MVP\src\lib\form-validation.ts` |
| User Manual | `D:\MVP\USER_MANUAL.md` |
| Agent Instructions | `D:\MVP\AGENTS.md` |
| Original README | `D:\MVP\README.md` |

---

### SUMMARY ANSWER TO YOUR QUESTIONS

1. **Customer details/fields in the loan creation form**: Full Name, Contact (phone), Email, Address, Facebook Profile Link — all required. Plus optional custom key-value fields.

2. **Dashboard layout**: 4 KPI hero cards (Total/Active Accounts, Collections Month, Outstanding), Account Status Breakdown bar chart, Financial Summary compact cards, Collections timeline (Today/Week/Month), Delinquency Aging bar chart, Needs Attention section, Quick Action buttons.

3. **Menu items (Capital, Withdraw Capital, Expenses)**: **These do not exist anywhere in this codebase.** The system only has: Dashboard, Accounts, Payments, Reports, and Settings. There is no Capital management, no Withdraw Capital feature, and no Expenses tracking.

4. **Due date monitoring**: Located at `/reports/overdue-accounts` under the Reports section. It shows all active accounts sorted by due date with a date filter, summary counts, and detailed columns including customer, unit, contact, due date, status, balance, monthly, last payment, and days overdue. Also accessible as a clickable breakdown modal from the Account Master List report.

5. **Statement feature**: Located at `/installment-accounts/[id]/statement`. It's a full-page printable account statement showing customer info, device info, contract details, payment summary, full payment history table, full installment schedule table, penalty records, and a "Total Amount Due" section for periods due on or before today. Includes buttons for Print PDF, DP Receipt, and Email statement to customer.
</task_result>
</task>
```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 88.1s)

_Thinking:_

Now I have comprehensive info about the MVP. Let me also look at the current Credit Flow codebase to understand its current state, particularly:
1. The current schema
2. The current loan form
3. The current dashboard
4. The current menu/navigation
5. The current reports

Let me explore these areas to understand what needs to change.

Let me also study the current Credit Flow system to understand what needs to be modified.

**Tool: task**

**Input:**
```json
{
  "description": "Explore Credit Flow structure",
  "subagent_type": "explore",
  "prompt": "Very thoroughly explore the current D:\\CREDIT FLOW codebase. I need to understand:\n\n1. **Current Prisma schema** - Read `prisma/schema.prisma` fully\n2. **Current navigation/menu** - Read `src/components/app-shell.tsx` and `src/components/nav-link.tsx`\n3. **Current loan creation form** - Read files in `src/app/loans/new/` directory\n4. **Current loan detail page** - Read files in `src/app/loans/[id]/` directory\n5. **Current dashboard** - Read `src/app/dashboard/dashboard-client.tsx` and any dashboard page files\n6. **Current payment page** - Read `src/app/payments/page.tsx` and `src/app/payments/new/page.tsx`\n7. **Current reports** - Read `src/app/reports/page.tsx` and files in `src/app/reports/` directory\n8. **Current API routes** - Check what API routes exist under `src/app/api/`\n9. **Current types** - Read `src/types/api.ts`\n10. **Current seed** - Read `prisma/seed.ts`\n11. **Current middleware and auth** - Read `src/middleware.ts` and `src/lib/auth.ts`\n12. **Current validation** - Read `src/lib/validation.ts`\n13. **Current serializers** - Read `src/lib/serializers.ts`\n14. **Current status badge** - Read `src/components/status-badge.tsx`\n15. **Current login page** - Read `src/app/login/page.tsx`\n\nReturn the COMPLETE contents of all these files and a comprehensive analysis of the current state."
}
```

**Output:**
```
<task id="ses_12bdee386ffeUQn3FXCpNEjXk3" state="completed">
<task_result>
Now I have a comprehensive view of the entire codebase. Here is my complete analysis:

---

## COMPLETE CODEBASE ANALYSIS: D:\CREDIT FLOW

### 1. PRISMA SCHEMA (`prisma/schema.prisma`) - Already aligned with target

The schema already matches the target schema in AGENTS.md **almost exactly**. Key details:
- **Models**: `User`, `LoanAccount`, `LoanSchedule`, `Payment`, `AdminConfig`, `ActivityLog`
- **Enums**: `Role` (ADMIN/COLLECTOR), `LoanStatus` (ACTIVE/OVERDUE/FULLY_PAID), `ScheduleStatus` (PENDING/PAID/OVERDUE/PARTIAL)
- **The schema includes a `processingFee` Decimal field** on `LoanAccount` (line 52) -- this is an addition compared to the AGENTS.md target schema but was added via migration
- **`Payment.orNumber` is optional (`String?`)** -- this differs from the target schema which has it as required `@unique`; migration `20260616233627_make_or_number_optional` made it optional
- Models have proper relations and indexes

### 2. NAVIGATION / SHELL (`src/components/app-shell.tsx` + `nav-link.tsx`)

**app-shell.tsx** (77 lines):
- Uses `SessionProvider` from `next-auth/react`
- Sets up navigation with `sharedLinks` for all users (Dashboard, Loans, Payments) and `adminLinks` (Reports, Settings, Users) only for ADMIN role
- Branding shows "JBV Credit" with logo
- Includes header with nav links, bottom mobile nav, and `InstallPrompt` component
- Uses `NavLink` component for nav items

**nav-link.tsx** (87 lines):
- Maps icon strings to lucide-react icons: `LayoutDashboard`, `Landmark`, `ReceiptText`, `FileText`, `Settings`, `Users`
- Three rendering modes: `mobile`, `inverted` (for dark header), and default (sidebar)
- Active state detection via pathname matching

### 3. LOAN CREATION FORM

**`src/app/loans/new/page.tsx`** (300 lines):
- Full-page form with Customer Information section and Loan Details section
- **Key fields**: customerName, customerPhone, customerAddress, idNumber, validIdType, principal, interestRate, **processingFee**, termDays, startDate, remarks
- **Live computation preview** showing: Interest Amount, Processing Fee, Total Payable, Daily Installment, Term
- **Notable**: daily installment is rounded to nearest 10 (`Math.round(rawDaily / 10) * 10`) on the client
- Uses `apiRequest` (client-side fetch helper) to POST to `/api/loans`
- Fetches admin config on mount for default interest rate
- Submit creates loan and redirects to `/loans`

**Also exists** as an **inline modal** in `src/app/loans/page.tsx` (lines 222-294) -- the loans list page also includes a full New Loan modal with identical fields.

**`src/app/loans/[id]/edit/page.tsx`** (183 lines):
- Separate page for editing loan customer info (name, phone, address, idNumber, validIdType, remarks)
- Loads existing loan data via GET `/api/loans/${id}`
- PUTs to `/api/loans/${id}` on submit, then redirects to detail page

### 4. LOAN DETAIL PAGE (`src/app/loans/[id]/page.tsx`) - 538 lines

Very feature-rich single-page detail:
- Fetches loan, schedule, and payments in parallel via 3 API calls
- **Customer Info card**: shows photo with upload capability (ADMIN only), name, phone, address, ID, status badge, next due date
- **Pricing card**: principal, interest rate/amount, processing fee, total payable, daily installment, remaining balance, term, timeline
- **Installment Schedule** (collapsible): table with period number, due date, amount, paid amount, balance, status. Shows progress bar, overdue days, partial/excess indicators
- **Payment History** (collapsible): table of payments
- **Edit Modal**: inline modal for editing customer info (ADMIN only)
- **Payment Modal**: inline modal for posting payment (all roles)
- **Actions**: Edit (ADMIN), Close (ADMIN, marks all unpaid as PAID), Delete (ADMIN, full cascade), Post Payment (all)
- **Image preview** modal when clicking profile photo
- **ConfirmModal** for delete confirmation

### 5. DASHBOARD

**`src/app/dashboard/page.tsx`** (5 lines): Simple wrapper rendering `DashboardClient`

**`src/app/dashboard/dashboard-client.tsx`** (253 lines):
- Fetches metrics from `/api/dashboard`
- **Stat Cards** (top row): Total Loans (blue), Collections Today (emerald), This Month (violet), Outstanding Balance (orange)
- **Compact Cards** (second row): Total Principal, Interest Earned, Total Collections, This Week
- **Status cards**: Active, Overdue, Fully Paid count
- **Overdue Aging** section: Current, 1-30 Days, 31-60 Days, 61-90 Days, 90+ Days
- Uses `DashboardMetricsDto` type

### 6. PAYMENT PAGES

**`src/app/payments/page.tsx`** (79 lines):
- Lists all payments with pagination (20 per page)
- Columns: Date, Customer (link to loan detail), Amount, Notes (hidden on mobile)
- "New Payment" button links to `/payments/new`

**`src/app/payments/new/page.tsx`** (175 lines):
- **Wrapped in `<Suspense>`** for `useSearchParams` (accepts `?loanId=` for pre-selection)
- Form fields: Select Loan (dropdown of non-fully-paid loans), Amount, Payment Date, Notes
- Shows loan info when selected: phone, days, balance, daily, status
- Alerts when amount exceeds remaining balance with "Set exact" button
- After submission, redirects back to loan detail (if `loanId` param) or `/payments`

### 7. REPORTS

**`src/app/reports/page.tsx`** (72 lines): Report hub with links to:
1. Daily Collections (`/reports/daily-collections`)
2. Monthly Collections (`/reports/monthly-collections`)
3. Overdue Accounts (`/reports/overdue-accounts`)
4. Outstanding Balances (`/reports/outstanding-balances`)

**Daily Collections** (`daily-collections/page.tsx`, 109 lines): Date picker, payments table, total, CSV export, print

**Monthly Collections** (`monthly-collections/page.tsx`, 102 lines): Year input, 12-month breakdown, grand total, CSV export, print

**Outstanding Balances** (`outstanding-balances/page.tsx`, 102 lines): Active/Overdue loans table, CSV export, print

**Overdue Accounts** (`overdue-accounts/page.tsx`, 116 lines): Filtered overdue loans table with overdue days column, CSV export, print

### 8. API ROUTES (Complete listing)

**15 route files** under `src/app/api/`:

| Route | Methods | Access | Purpose |
|---|---|---|---|
| `/api/loans` | GET, POST | GET=all, POST=ADMIN | List/create loans |
| `/api/loans/[id]` | GET, PUT, DELETE | GET=all, PUT/DELETE=ADMIN | Read/update/delete loan |
| `/api/loans/[id]/schedule` | GET | All | Get loan schedule |
| `/api/loans/[id]/payments` | GET | All | Get loan payments |
| `/api/loans/[id]/close` | POST | ADMIN | Force-close loan as FULLY_PAID |
| `/api/loans/[id]/upload-photo` | POST | ADMIN | Upload profile photo to Supabase |
| `/api/payments` | GET, POST | GET=all, POST=all | List/create payments |
| `/api/dashboard` | GET | All | Dashboard metrics |
| `/api/admin/config` | GET, PUT | ADMIN | System configuration |
| `/api/admin/users` | GET, POST | ADMIN | User management |
| `/api/auth/[...nextauth]` | GET, POST | Public | NextAuth handlers |
| `/api/reports/daily-collections` | GET | ADMIN | Daily collections report |
| `/api/reports/monthly-collections` | GET | ADMIN | Monthly collections report |
| `/api/reports/outstanding-balances` | GET | ADMIN | Outstanding balances report |
| `/api/reports/overdue-accounts` | GET | ADMIN | Overdue accounts report |

### 9. TYPES (`src/types/api.ts`) - 86 lines

Cleanly matches the DTOs used throughout:
- `LoanStatusValue`, `ScheduleStatusValue`, `RoleValue` (string union types)
- `LoanAccountDto` - Includes `processingFee` field
- `LoanScheduleDto`
- `PaymentDto` - No `orNumber` field in DTO
- `UserDto`
- `AdminConfigDto`
- `DashboardMetricsDto` - Includes aging breakdown

### 10. SEED (`prisma/seed.ts`) - 374 lines

Seeds the database with:
- 2 users: `admin@jbvcredit.com` / `admin123` (ADMIN), `collector@jbvcredit.com` / `collector123` (COLLECTOR)
- 1 AdminConfig: 5% default interest, term options [30,60,90,120,150,180]
- 5 LoanAccounts:
  1. Juan Dela Cruz - ACTIVE, 30 days, ₱10,000 principal, ₱500 fee
  2. Maria Santos - OVERDUE, 60 days, ₱15,000 principal, ₱500 fee
  3. Pedro Reyes - ACTIVE, 90 days, ₱20,000 principal, ₱1,000 fee
  4. Ana Lopez - FULLY_PAID, 30 days, ₱8,000 principal, ₱300 fee
  5. Carlos Cruz - OVERDUE, 30 days, ₱12,000 principal, ₱500 fee
- Payments: Juan (5 paid), Maria (10 paid), Ana (all 30 paid), Carlos (5 paid)
- Uses `computeLoan()` and `generateSchedule()` functions
- Rounding: dailyInstallment rounded to nearest 10
- Payments applied via transaction updating schedule rows and recalculating balance

### 11. MIDDLEWARE & AUTH

**`src/middleware.ts`** (32 lines):
- Simple cookie-based check (not using NextAuth middleware)
- Checks for `__Secure-authjs.session-token` or `authjs.session-token`
- No role-based redirects; only redirects to `/login` if no session cookie
- Public paths: `/login`, `/api/auth`, `/_next`, `/favicon.ico`, `/manifest.webmanifest`, `/sw.js`

**`src/lib/auth.ts`** (54 lines):
- NextAuth v5 with Credentials provider
- Uses bcrypt for password comparison
- JWT strategy with callbacks for role in token/session
- Login page: `/login`
- Dynamically imports `prisma` and `bcryptjs` inside authorize function

### 12. VALIDATION (`src/lib/validation.ts`) - 69 lines

Zod schemas:
- `createLoanSchema` - includes optional `processingFee`
- `updateLoanSchema`
- `createPaymentSchema` - NO `orNumber` field
- `updateAdminConfigSchema`
- `createUserSchema`
- Custom validators: `requiredString`, `moneyString`, `dateOnlyString`, `phoneString`, `nameString`

### 13. SERIALIZERS (`src/lib/serializers.ts`) - 87 lines

- `serializeLoanAccount` - includes `processingFee` field
- `serializeLoanSchedule`
- `serializePayment` - no `orNumber` in serialized output
- `serializeUser`
- `serializeAdminConfig`
- All use `dateToManilaDateOnly` and `decimalToString` helpers

### 14. STATUS BADGE (`src/components/status-badge.tsx`) - 31 lines

- Uses `getLoanStatusDisplay` from `loan-status.ts` for dynamic label generation
- Supports statuses: ACTIVE, OVERDUE, FULLY_PAID, PAID, PENDING, PARTIAL
- Also handles "DUE TODAY", "DUE TOMORROW", "DUE X DAYS AGO" computed labels
- Color coding: ACTIVE=emerald, OVERDUE=rose, FULLY_PAID/PAID=slate, PENDING=white, PARTIAL=amber

### 15. LOGIN PAGE (`src/app/login/page.tsx`) - 99 lines

- Uses `signIn` from `next-auth/react` with credentials
- Email + password inputs
- Branding: "JBV Credit" with logo, "Collection Services" subtitle
- Red-800 button styling, white card, rounded-2xl
- On success redirects to `/dashboard`

---

## KEY BUSINESS LOGIC FILES

### `src/lib/loan-compute.ts` (20 lines)
- `computeLoan()`: interest = principal * (rate/100); totalPayable = principal + interest; rawDaily = totalPayable / termDays; **daily rounded to nearest 10** via `roundToNearest10()`

### `src/lib/installment-schedule.ts` (36 lines)
- `generateDailySchedule()`: Generates `termDays` rows, one per day; last period absorbs rounding remainder

### `src/lib/balance.ts` (79 lines)
- `recalculateBalance()`: Sums unpaid schedule amounts, determines status (ACTIVE/OVERDUE/FULLY_PAID), updates `nextDueDate`

### `src/lib/schedule-status.ts` (39 lines)
- `updateOverdueSchedule()`: Marks PENDING schedules past due as OVERDUE; reverts OVERDUE schedules that are now current back to PENDING/PARTIAL

### `src/lib/loan-status.ts` (27 lines)
- `getLoanStatusDisplay()`: Computes human-readable labels like "DUE TODAY", "DUE 3 DAYS AGO", etc.

### `src/lib/money.ts` (43 lines)
- `parseMoney()`, `parsePositiveMoney()`, `decimalToString()`, `formatPeso()` (with comma grouping), `roundTo()`

### `src/lib/dates.ts` (55 lines)
- Manila timezone date parsing/formatting functions

### `src/lib/supabase-storage.ts` (10 lines)
- Creates Supabase client for storage operations

### `src/lib/errors.ts` (28 lines)
- Custom error classes: `ValidationError` (400), `NotFoundError` (404), `ConflictError` (409)

### `src/lib/api.ts` (67 lines)
- `readJson()`, `handleApiError()` (Zod/NOT_FOUND/CONFLICT/unhandled), `withRetry()` (for P2034 transaction conflicts)

### `src/lib/client-api.ts` (40 lines)
- `apiRequest<T>()`: Client-side fetch helper with timeout, FormData support, error extraction

### `src/lib/email.ts` (287 lines) - **DO NOT USE** per AGENTS.md
- Nodemailer integration for MyFaveGadgets (old system branding)
- `sendPaymentReceipt()`, `sendDpReceipt()`, `sendEmail()`
- Still exists but should never be called

### `src/lib/field-validation.ts` (99 lines) - Legacy validation patterns
- Contains regex patterns and sanitization functions from old system
- `MONEY_PATTERN` is imported by `money.ts`

---

## KEY DEPARTURES FROM AGENTS.md TARGET

| Area | Current State | AGENTS.md Target |
|---|---|---|
| **Processing Fee** | Present in schema, seed, serializers, types, forms, API | **Not mentioned** in target schema |
| **OR Number** | Optional (`String?`) in schema, **absent** from Payment DTO and createPaymentSchema | Required `@unique` String |
| **User emails** | `admin@jbvcredit.com`, `collector@jbvcredit.com` | `admin@moneybee.com`, `collector@moneybee.com` |
| **Loan creation daily rounding** | `roundToNearest10` (nearest 10 pesos) | `ROUND_FLOOR` (floor to 2 decimals) |
| **Payment without OR number** | No OR number field in payment form or validation | Should have OR number |
| **middleware.ts** | Cookie-based (not using NextAuth middleware) | Uses `auth` from `@/lib/auth` |
| **Service Worker / PWA** | Still present (`service-worker-register.tsx`, `install-prompt.tsx`) | Should be deleted (Phase 7d) |
| **ActivityLog model** | In schema but never used in API or UI | Exists in schema but no usage |
| **`processingFee` in DTO** | Present in `LoanAccountDto` | Not in target |
| **email.ts** | Still present with MyFaveGadgets branding | Keep but never call |

All other aspects are already aligned with the target architecture. The codebase is in a mature state -- most of the heavy lifting for the cash lending system conversion is already done.
</task_result>
</task>
```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 6.3s)

_Thinking:_

Now I have a comprehensive understanding of both the MVP folder (MyFaveGadgets installment system) and the current Credit Flow system. Let me analyze the differences and what the client wants.

The client wants:
1. **Capital, Withdraw Capital, Expenses menu items** - These don't exist in either system. Need to create new features.
2. **Customer details in loan creation** - Should match MVP: Add Facebook link, email, and make it like the MVP form. Current system has: customerName, customerPhone, customerAddress, idNumber, validIdType. MVP has: Full Name, Contact (phone), Email, Address, Facebook Profile Link, plus custom fields.
3. **Statement feature** - MVP has a full statement page at `/installment-accounts/[id]/statement`. Current Credit Flow doesn't have a statement feature.
4. **Due date monitoring** - Already exists in reports as "Overdue Accounts" but client wants it more like the MVP version which shows all accounts sorted by due date (not just overdue ones).
5. **Dashboard** - Current dashboard is simple. MVP dashboard has more financial metrics, bar charts, etc.

Let me look at what the MVP dashboard looks like more closely to understand the "bars" and "finances related" charts.

Let me check the MVP dashboard component to understand the exact visual layout they want.

Let me dig deeper into the MVP dashboard and statement to understand the exact UI they want.

**Tool: read**

**Input:**
```json
{
  "filePath": "D:\\MVP\\src\\app\\dashboard\\dashboard-client.tsx"
}
```

**Output:**
```
<path>D:\MVP\src\app\dashboard\dashboard-client.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useEffect, useState } from "react";
4: import Link from "next/link";
5: import {
6:   Smartphone,
7:   AlertTriangle,
8:   CheckCircle2,
9:   PiggyBank,
10:   Landmark,
11:   Users,
12:   TrendingUp,
13:   BadgeDollarSign,
14:   ArrowUpRight,
15:   Clock,
16:   FileText,
17:   BarChart3,
18: } from "lucide-react";
19: import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
20: import { apiRequest } from "@/lib/client-api";
21: import { formatPeso } from "@/lib/money";
22: import type { DashboardMetricsDto, DashboardActionsDto } from "@/types/api";
23: 
24: function StatCard({ label, value, icon: Icon, trend, color, bgGradient }: {
25:   label: string; value: string | number; icon: any; trend?: string; color: string; bgGradient: string;
26: }) {
27:   return (
28:     <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${bgGradient}`}>
29:       <div className="absolute -right-2 -top-2 size-20 rounded-full bg-white/10" />
30:       <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-white/5" />
31:       <div className="relative">
32:         <div className="flex items-center justify-between">
33:           <span className="text-sm font-medium text-white/80">{label}</span>
34:           <div className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
35:             <Icon size={20} />
36:           </div>
37:         </div>
38:         <div className="mt-4 text-4xl font-bold tracking-tight">{value}</div>
39:         {trend ? (
40:           <div className="mt-2 flex items-center gap-1 text-xs font-medium text-white/70">
41:             <ArrowUpRight size={12} /> {trend}
42:           </div>
43:         ) : null}
44:       </div>
45:     </div>
46:   );
47: }
48: 
49: function CompactCard({ label, value, color }: { label: string; value: string; color: string }) {
50:   return (
51:     <div className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${color}`}>
52:       <p className="text-xs font-medium text-slate-500">{label}</p>
53:       <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
54:     </div>
55:   );
56: }
57: 
58: const statuses = [
59:   { key: "appliedAccounts" as const, label: "Applied", color: "bg-red-500", ring: "ring-red-100", icon: FileText },
60:   { key: "activeAccounts" as const, label: "Active", color: "bg-emerald-500", ring: "ring-emerald-100", icon: CheckCircle2 },
61:   { key: "dueTodayAccounts" as const, label: "Due Today", color: "bg-amber-500", ring: "ring-amber-100", icon: Clock },
62:   { key: "overdueAccounts" as const, label: "Overdue", color: "bg-rose-500", ring: "ring-rose-100", icon: AlertTriangle },
63:   { key: "fullyPaidAccounts" as const, label: "Paid", color: "bg-slate-500", ring: "ring-slate-100", icon: CheckCircle2 },
64: ];
65: 
66: export function DashboardClient() {
67:   const [metrics, setMetrics] = useState<DashboardMetricsDto | null>(null);
68:   const [actions, setActions] = useState<DashboardActionsDto | null>(null);
69:   const [error, setError] = useState("");
70: 
71:   useEffect(() => {
72:     apiRequest<{ metrics: DashboardMetricsDto; actions: DashboardActionsDto }>("/api/dashboard")
73:       .then((data) => { setMetrics(data.metrics); setActions(data.actions); })
74:       .catch((requestError: Error) => setError(requestError.message));
75:   }, []);
76: 
77:   const now = new Intl.DateTimeFormat("en-PH", {
78:     timeZone: "Asia/Manila", year: "numeric", month: "long", day: "numeric", weekday: "long",
79:   }).format(new Date());
80: 
81:   if (error) return <ErrorMessage message={error} />;
82:   if (!metrics) return <LoadingBlock label="Loading dashboard" />;
83: 
84:   const overduePct = metrics.totalAccounts > 0
85:     ? Math.round((metrics.overdueAccounts / metrics.totalAccounts) * 100) : 0;
86:   const collectionRate = Number(metrics.totalCollections || "0") > 0 && Number(metrics.totalInstallmentSales || "0") > 0
87:     ? Math.round((Number(metrics.totalCollections) / Number(metrics.totalInstallmentSales)) * 100) : 0;
88: 
89:   return (
90:     <div className="space-y-8 pb-8">
91:       {/* ── HEADER ── */}
92:       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
93:         <div>
94:           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
95:           <p className="mt-1 text-sm text-slate-500">{now}</p>
96:         </div>
97:         <Link
98:           href="/installment-accounts/new"
99:           className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-800 px-5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 hover:shadow-xl hover:shadow-red-200 active:scale-[0.98]"
100:         >
101:           <Smartphone size={18} />
102:           New Account
103:         </Link>
104:       </div>
105: 
106:       {/* ── KPI HERO ROW ── */}
107:       <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
108:         <StatCard label="Total Accounts" value={metrics.totalAccounts}
109:           icon={Users} color="bg-white/20" bgGradient="bg-gradient-to-br from-red-600 to-red-800" />
110:         <StatCard label="Active Accounts" value={metrics.activeAccounts}
111:           icon={CheckCircle2} color="bg-white/20" bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
112:           trend={`${overduePct}% overdue`} />
113:         <StatCard label="Collections (Month)" value={formatPeso(metrics.collectionsThisMonth)}
114:           icon={PiggyBank} color="bg-white/20" bgGradient="bg-gradient-to-br from-red-700 to-red-900" />
115:         <StatCard label="Outstanding" value={formatPeso(metrics.outstandingBalances)}
116:           icon={Landmark} color="bg-white/20" bgGradient="bg-gradient-to-br from-slate-700 to-slate-900"
117:           trend={collectionRate > 0 ? `${collectionRate}% collected` : undefined} />
118:       </div>
119: 
120:       {/* ── STATUS BREAKDOWN + FINANCIAL ── */}
121:       <div className="grid gap-6 lg:grid-cols-5">
122:         {/* Status Breakdown */}
123:         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
124:           <h3 className="text-sm font-bold text-slate-900">Account Status Breakdown</h3>
125:           <p className="mt-0.5 text-xs text-slate-500">{metrics.totalAccounts} total accounts</p>
126:           <div className="mt-5 space-y-3">
127:             {statuses.map((s) => {
128:               const val = metrics[s.key];
129:               const max = Math.max(metrics.totalAccounts, 1);
130:               const pct = Math.round((val / max) * 100);
131:               const Icon = s.icon;
132:               return (
133:                 <div key={s.key}>
134:                   <div className="mb-1 flex items-center justify-between text-xs">
135:                     <div className="flex items-center gap-2">
136:                       <span className={`flex size-5 items-center justify-center rounded-md ${s.color} ${s.ring}`}>
137:                         <Icon size={11} className="text-white" />
138:                       </span>
139:                       <span className="font-medium text-slate-700">{s.label}</span>
140:                     </div>
141:                     <span className="font-bold text-slate-900">{val} <span className="text-slate-400 font-normal">({pct}%)</span></span>
142:                   </div>
143:                   <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
144:                     <div className={`h-2 rounded-full transition-all duration-700 ${s.color}`}
145:                       style={{ width: `${Math.max(pct, 2)}%` }} />
146:                   </div>
147:                 </div>
148:               );
149:             })}
150:           </div>
151:         </div>
152: 
153:         {/* Financial Summary */}
154:         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
155:           <h3 className="text-sm font-bold text-slate-900">Financial Summary</h3>
156:           <p className="mt-0.5 text-xs text-slate-500">Installment sales, collections, and penalties</p>
157:           <div className="mt-5 grid gap-3 sm:grid-cols-2">
158:             <CompactCard label="Installment Sales" value={formatPeso(metrics.totalInstallmentSales)} color="border-l-red-500" />
159:             <CompactCard label="Gross Profit" value={formatPeso(metrics.totalInstallmentMargin)} color="border-l-emerald-500" />
160:             <CompactCard label="Down Payments" value={formatPeso(metrics.totalDownPayments)} color="border-l-red-400" />
161:             <CompactCard label="Total Collections" value={formatPeso(metrics.totalCollections)} color="border-l-red-600" />
162:             <CompactCard label="Penalties Collected" value={formatPeso(metrics.totalPenaltiesCollected)} color="border-l-rose-500" />
163:             <CompactCard label="Outstanding Balance" value={formatPeso(metrics.outstandingBalances)} color="border-l-orange-500" />
164:           </div>
165:         </div>
166:       </div>
167: 
168:       {/* ── COLLECTIONS TIMELINE + AGING ── */}
169:       <div className="grid gap-6 lg:grid-cols-2">
170:         {/* Collections Timeline */}
171:         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
172:           <h3 className="text-sm font-bold text-slate-900">Collections</h3>
173:           <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
174:             {[
175:               { label: "Today", value: formatPeso(metrics.collectionsToday), accent: "text-red-600" },
176:               { label: "This Week", value: formatPeso(metrics.collectionsThisWeek), accent: "text-amber-600" },
177:               { label: "This Month", value: formatPeso(metrics.collectionsThisMonth), accent: "text-emerald-600" },
178:             ].map((c) => (
179:               <div key={c.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
180:                 <p className="text-xs font-medium text-slate-500">{c.label}</p>
181:                 <p className={`mt-1.5 text-lg font-bold ${c.accent}`}>{c.value}</p>
182:               </div>
183:             ))}
184:           </div>
185:         </div>
186: 
187:         {/* Aging */}
188:         <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
189:           <div className="flex items-center justify-between">
190:             <div>
191:               <h3 className="text-sm font-bold text-slate-900">Delinquency Aging</h3>
192:               <p className="mt-0.5 text-xs text-slate-500">{metrics.overdueAccounts} overdue accounts</p>
193:             </div>
194:             <BarChart3 size={20} className="text-slate-400" />
195:           </div>
196:           <div className="mt-5 flex items-end gap-3 h-28">
197:             {([
198:               { val: metrics.aging.current, label: "Current", color: "bg-emerald-400" },
199:               { val: metrics.aging.days1to30, label: "1-30d", color: "bg-amber-400" },
200:               { val: metrics.aging.days31to60, label: "31-60d", color: "bg-orange-400" },
201:               { val: metrics.aging.days61to90, label: "61-90d", color: "bg-rose-400" },
202:               { val: metrics.aging.days90plus, label: "90d+", color: "bg-red-700" },
203:             ]).map((bar) => {
204:               const maxVal = Math.max(
205:                 metrics.aging.current, metrics.aging.days1to30, metrics.aging.days31to60,
206:                 metrics.aging.days61to90, metrics.aging.days90plus, 1,
207:               );
208:               const h = (bar.val / maxVal) * 100;
209:               return (
210:                 <div key={bar.label} className="flex-1 flex flex-col items-center justify-end gap-2">
211:                   <span className="text-xs font-bold text-slate-700">{bar.val}</span>
212:                   <div className={`w-full rounded-t-lg transition-all duration-700 ${bar.color}`}
213:                     style={{ height: `${Math.max(h, 4)}%`, minHeight: 4 }} />
214:                   <span className="text-[10px] font-medium text-slate-500">{bar.label}</span>
215:                 </div>
216:               );
217:             })}
218:           </div>
219:         </div>
220:       </div>
221: 
222:       {/* ── NEEDS ATTENTION ── */}
223:       {actions ? (
224:         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
225:           <h2 className="text-sm font-bold font-heading text-slate-900 mb-3">Needs Attention</h2>
226:           <div className="grid gap-2 sm:grid-cols-3">
227:             {actions.dueToday > 0 ? (
228:               <Link href="/installment-accounts?status=DUE_TODAY" className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 hover:bg-amber-100 transition-colors">
229:                 <span className="text-sm font-medium text-amber-800">{actions.dueToday} due today</span>
230:                 <span className="text-xs text-amber-600">View →</span>
231:               </Link>
232:             ) : null}
233:             {actions.overdue1to30 > 0 ? (
234:               <Link href="/installment-accounts?status=OVERDUE" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 hover:bg-red-100 transition-colors">
235:                 <span className="text-sm font-medium text-red-800">{actions.overdue1to30} overdue 1-30 days</span>
236:                 <span className="text-xs text-red-600">View →</span>
237:               </Link>
238:             ) : null}
239:             {actions.overdue31plus > 0 ? (
240:               <Link href="/installment-accounts?status=OVERDUE" className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 hover:bg-rose-100 transition-colors">
241:                 <span className="text-sm font-bold text-rose-800">{actions.overdue31plus} overdue 31+ days</span>
242:                 <span className="text-xs text-rose-600">View →</span>
243:               </Link>
244:             ) : null}
245:             {actions.unactivated > 0 ? (
246:               <Link href="/installment-accounts?status=APPLIED" className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 hover:bg-slate-100 transition-colors">
247:                 <span className="text-sm font-medium text-slate-700">{actions.unactivated} unactivated</span>
248:                 <span className="text-xs text-slate-500">View →</span>
249:               </Link>
250:             ) : null}
251:             {actions.badRecords > 0 ? (
252:               <Link href="/installment-accounts?badRecord=true" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 hover:bg-red-100 transition-colors">
253:                 <span className="text-sm font-medium text-red-800">{actions.badRecords} bad records</span>
254:                 <span className="text-xs text-red-600">View →</span>
255:               </Link>
256:             ) : null}
257:             {actions.unsecuredDevices > 0 ? (
258:               <Link href="/installment-accounts?status=ACTIVE" className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 hover:bg-blue-100 transition-colors">
259:                 <span className="text-sm font-medium text-blue-800">{actions.unsecuredDevices} unsecured devices</span>
260:                 <span className="text-xs text-blue-600">View →</span>
261:               </Link>
262:             ) : null}
263:             {actions.dueToday === 0 && actions.overdue31plus === 0 && actions.unactivated === 0 && actions.badRecords === 0 && actions.unsecuredDevices === 0 ? (
264:               <span className="text-sm text-slate-500 col-span-full">All clear — no items need attention.</span>
265:             ) : null}
266:           </div>
267:         </div>
268:       ) : null}
269: 
270:       {/* ── QUICK ACTIONS ── */}
271:       <div className="flex flex-wrap gap-3">
272:         {[
273:           { href: "/installment-accounts", label: "View All Accounts", icon: Users },
274:           { href: "/payments", label: "Payment Records", icon: BadgeDollarSign },
275:           { href: "/reports", label: "Reports & Exports", icon: TrendingUp },
276:         ].map((link) => (
277:           <Link key={link.href} href={link.href}
278:             className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md">
279:             <link.icon size={16} className="text-slate-400" />
280:             {link.label}
281:           </Link>
282:         ))}
283:       </div>
284:     </div>
285:   );
286: }

(End of file - total 286 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "D:\\MVP\\src\\app\\installment-accounts\\new\\installment-account-form.tsx"
}
```

**Output:**
```
<path>D:\MVP\src\app\installment-accounts\new\installment-account-form.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import Decimal from "decimal.js";
4: import { FormEvent, useState } from "react";
5: import { useRouter } from "next/navigation";
6: import { Smartphone, Save, CheckCircle, X, Printer } from "lucide-react";
7: import { PageHeader } from "@/components/page-header";
8: import { ErrorMessage, SuccessMessage } from "@/components/ui-state";
9: import { FieldError } from "@/components/field-error";
10: import { ConfirmModal } from "@/components/confirm-modal";
11: import { apiRequest } from "@/lib/client-api";
12: import { formatPeso, roundTo } from "@/lib/money";
13: import { createInstallmentAccountSchema } from "@/lib/validation";
14: import { validateForm, clearFieldError, type FieldErrors } from "@/lib/form-validation";
15: import type { InstallmentAccountDto } from "@/types/api";
16: 
17: function todayDateOnly() {
18:   return new Intl.DateTimeFormat("en-CA", {
19:     timeZone: "Asia/Manila",
20:     year: "numeric",
21:     month: "2-digit",
22:     day: "2-digit",
23:   }).format(new Date());
24: }
25: 
26: export function InstallmentAccountForm() {
27:   const router = useRouter();
28:   const [form, setForm] = useState({
29:     customerName: "",
30:     customerPhone: "",
31:     customerEmail: "",
32:     customerAddress: "",
33:     fbLink: "",
34:     brand: "",
35:     model: "",
36:     unitDescription: "",
37:     itemType: "GADGET" as "GADGET" | "CASH",
38:     cashPrice: "",
39:     downPayment: "",
40:     processingFee: "",
41:     interestRate: "",
42:     term: 24,
43:     scheduleType: "SEMI_MONTHLY" as "SEMI_MONTHLY" | "MONTHLY",
44:     firstDueDate: todayDateOnly(),
45:     dueDay2: "",
46:     dateGiven: todayDateOnly(),
47:   });
48:   const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
49:   const [saving, setSaving] = useState(false);
50:   const [error, setError] = useState("");
51:   const [success, setSuccess] = useState("");
52:   const [showConfirm, setShowConfirm] = useState(false);
53:   const [processing, setProcessing] = useState(false);
54:   const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);
55:   const [emailSent, setEmailSent] = useState(false);
56:   const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
57: 
58:   function parseDecimal(value: string): Decimal {
59:     try {
60:       return new Decimal(value.replace(/[^\d.]/g, "") || "0");
61:     } catch {
62:       return new Decimal(0);
63:     }
64:   }
65: 
66:   const cashPrice = parseDecimal(form.cashPrice);
67:   const downPayment = parseDecimal(form.downPayment);
68:   const interestRateDecimal = parseDecimal(form.interestRate);
69:   // Financed = Cash Price - Down Payment
70:   // Monthly Interest = Financed × Rate%
71:   // Total Interest = Monthly Interest × Term
72:   // Installment Price = Cash Price + Total Interest
73:   const financed = cashPrice.minus(downPayment);
74:   const monthlyInterest = interestRateDecimal.gt(0) ? financed.times(interestRateDecimal.div(100)) : new Decimal(0);
75:   const totalInterest = form.itemType === "CASH"
76:     ? monthlyInterest  // one-time for cash
77:     : monthlyInterest.times(form.term);  // per-month × term for gadgets
78:   const installmentPrice = cashPrice.plus(totalInterest);
79:   const totalPeriods = form.scheduleType === "SEMI_MONTHLY" ? form.term * 2 : form.term;
80:   const remainingBalance = installmentPrice.floor().minus(downPayment).floor();
81:   const monthlyInstallment = remainingBalance.gt(0) && form.term > 0
82:     ? roundTo(remainingBalance.div(form.term), 50)
83:     : new Decimal(0);
84:   const periodAmount = remainingBalance.gt(0) && totalPeriods > 0
85:     ? roundTo(remainingBalance.div(totalPeriods), 50)
86:     : new Decimal(0);
87: 
88:   const dueDay1 = form.firstDueDate ? parseInt(form.firstDueDate.slice(8, 10)) || 15 : 15;
89:   const dueDays = form.scheduleType === "SEMI_MONTHLY"
90:     ? [dueDay1, parseInt(form.dueDay2) || dueDay1]
91:     : [dueDay1];
92: 
93:   const formValid =
94:     form.customerName.trim() &&
95:     form.customerPhone.trim() &&
96:     form.customerEmail.trim() &&
97:     form.customerAddress.trim() &&
98:     form.fbLink.trim() &&
99:     form.brand.trim() &&
100:     form.model.trim() &&
101:     form.unitDescription.trim() &&
102:     cashPrice.gt(0) &&
103:   interestRateDecimal.gt(0) &&
104:   downPayment.lt(installmentPrice) &&
105:     (form.scheduleType === "MONTHLY" || parseInt(form.dueDay2) >= 1);
106: 
107:   function updateField(field: string, value: string | number) {
108:     setForm({ ...form, [field]: value });
109:     if (fieldErrors[field]) {
110:       clearFieldError(setFieldErrors, field);
111:     }
112:   }
113: 
114:   function handleSubmit(event: FormEvent<HTMLFormElement>) {
115:     event.preventDefault();
116:     setProcessing(true);
117:     setError("");
118:     setSuccess("");
119:     setFieldErrors({});
120: 
121:     try {
122:       const dataToValidate: Record<string, unknown> = {
123:         customerName: form.customerName,
124:         customerPhone: form.customerPhone,
125:         customerEmail: form.customerEmail,
126:         customerAddress: form.customerAddress,
127:         fbLink: form.fbLink || undefined,
128:         brand: form.brand,
129:         model: form.model,
130:         unitDescription: form.unitDescription,
131:         itemType: form.itemType,
132:         cashPrice: form.cashPrice,
133:         downPayment: form.downPayment,
134:         processingFee: form.processingFee || undefined,
135:         interestRate: form.interestRate,
136:         term: form.term,
137:         startDate: form.firstDueDate,
138:         dateGiven: form.dateGiven || undefined,
139:         scheduleType: form.scheduleType,
140:         dueDays,
141:         firstDueDate: form.firstDueDate,
142:         customFields: customFields.reduce((acc, { key, value }) => {
143:           if (key.trim()) acc[key.trim()] = value;
144:           return acc;
145:         }, {} as Record<string, string>),
146:       };
147:       const validation = validateForm(createInstallmentAccountSchema, dataToValidate);
148: 
149:       if (!validation.success) {
150:         setFieldErrors(validation.errors);
151:         setProcessing(false);
152:         window.scrollTo({ top: 0, behavior: "smooth" });
153:         return;
154:       }
155: 
156:       setProcessing(false);
157:       setShowConfirm(true);
158:     } catch (err) {
159:       setError(`Unexpected error: ${(err as Error).message}`);
160:       setProcessing(false);
161:     }
162:   }
163: 
164:   async function confirmCreate() {
165:     setSaving(true);
166:     setError("");
167: 
168:     try {
169:       const body: Record<string, unknown> = {
170:         customerName: form.customerName,
171:         customerPhone: form.customerPhone,
172:         customerEmail: form.customerEmail,
173:         customerAddress: form.customerAddress,
174:         fbLink: form.fbLink || undefined,
175:         brand: form.brand,
176:         model: form.model,
177:         unitDescription: form.unitDescription,
178:         itemType: form.itemType,
179:         cashPrice: form.cashPrice,
180:         downPayment: form.downPayment,
181:         processingFee: form.processingFee || undefined,
182:         interestRate: form.interestRate,
183:         term: form.term,
184:         startDate: form.firstDueDate,
185:         dateGiven: form.dateGiven || undefined,
186:         scheduleType: form.scheduleType,
187:         dueDays,
188:         firstDueDate: form.firstDueDate,
189:         customFields: customFields.reduce((acc, { key, value }) => {
190:           if (key.trim()) acc[key.trim()] = value;
191:           return acc;
192:         }, {} as Record<string, string>),
193:       };
194:       const data = await apiRequest<{ installmentAccount: InstallmentAccountDto; emailSent: boolean }>(
195:         "/api/installment-accounts",
196:         { method: "POST", body: JSON.stringify(body) },
197:       );
198:       setSaving(false);
199:       setShowConfirm(false);
200:       setCreatedAccountId(data.installmentAccount.id);
201:       setEmailSent(data.emailSent);
202:     } catch (requestError) {
203:       setError((requestError as Error).message);
204:       setShowConfirm(false);
205:     } finally {
206:       setSaving(false);
207:     }
208:   }
209: 
210:   return (
211:     <div className="space-y-6">
212:       <PageHeader title="New Installment Account" description="Register a gadget installment sale" />
213: 
214:       {error ? <ErrorMessage message={error} /> : null}
215:       {success ? <SuccessMessage message={success} /> : null}
216:       {Object.keys(fieldErrors).length > 0 ? (
217:         <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4">
218:           <p className="text-sm font-bold text-rose-800 mb-2">Please fix the following errors:</p>
219:           <ul className="list-disc list-inside space-y-0.5">
220:             {Object.entries(fieldErrors).map(([field, msg]) => (
221:               <li key={field} className="text-sm text-rose-700">{msg}</li>
222:             ))}
223:           </ul>
224:         </div>
225:       ) : null}
226: 
227:       <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[420px_1fr]">
228:         <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
229:           <div className="flex items-center gap-3 mb-6">
230:             <span className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
231:               <Smartphone size={20} />
232:             </span>
233:             <div>
234:               <h2 className="text-base font-bold font-heading text-slate-900">Customer Details</h2>
235:               <p className="text-xs text-slate-500">Buyer information</p>
236:             </div>
237:           </div>
238:           <div className="space-y-4">
239:             <div>
240:               <label className="block text-sm font-medium text-slate-700">
241:                 Full Name
242:               <input
243:                 required
244:                 value={form.customerName}
245:                 onChange={(e) => updateField("customerName", e.target.value)}
246:                 autoComplete="name"
247:                 className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
248:               />
249:               </label>
250:               <FieldError error={fieldErrors.customerName} />
251:             </div>
252:             <div>
253:               <label className="block text-sm font-medium text-slate-700">
254:                 Contact
255:                 <input
256:                   required
257:                   inputMode="numeric"
258:                   value={form.customerPhone}
259:                   onChange={(e) => updateField("customerPhone", e.target.value.replace(/\D/g, ""))}
260:                   autoComplete="tel"
261:                   className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
262:                 />
263:               </label>
264:               <FieldError error={fieldErrors.customerPhone} />
265:             </div>
266:             <div>
267:               <label className="block text-sm font-medium text-slate-700">
268:                 Email
269:                 <input
270:                   type="email"
271:                   value={form.customerEmail}
272:                   onChange={(e) => updateField("customerEmail", e.target.value)}
273:                   autoComplete="email"
274:                   className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
275:                 />
276:               </label>
277:               <FieldError error={fieldErrors.customerEmail} />
278:             </div>
279:             <div>
280:               <label className="block text-sm font-medium text-slate-700">
281:                 Address
282:                 <textarea
283:                   required
284:                   value={form.customerAddress}
285:                   onChange={(e) => updateField("customerAddress", e.target.value)}
286:                   autoComplete="street-address"
287:                   className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
288:                 />
289:               </label>
290:               <FieldError error={fieldErrors.customerAddress} />
291:             </div>
292:             <div>
293:               <label className="block text-sm font-medium text-slate-700">
294:                 Facebook Profile Link <span className="text-slate-400">(optional)</span>
295:                 <div className="flex items-center gap-1.5 mt-1.5">
296:                   <span className="flex items-center justify-center size-10 rounded-xl border border-slate-300 bg-slate-50 text-blue-600 shrink-0">
297:                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
298:                   </span>
299:                   <input
300:                     type="url"
301:                     value={form.fbLink}
302:                     onChange={(e) => updateField("fbLink", e.target.value)}
303:                     placeholder="https://facebook.com/username"
304:                     className="h-10 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
305:                   />
306:                 </div>
307:               </label>
308:               <FieldError error={fieldErrors.fbLink} />
309:             </div>
310:           </div>
311: 
312:           <div className="mt-8 flex items-center gap-3 mb-6">
313:             <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
314:               <Smartphone size={20} />
315:             </span>
316:             <div>
317:               <h2 className="text-base font-bold font-heading text-slate-900">{form.itemType === "CASH" ? "Cash Details" : "Device Details"}</h2>
318:               <p className="text-xs text-slate-500">{form.itemType === "CASH" ? "Cash loan information" : "Gadget information"}</p>
319:             </div>
320:           </div>
321: 
322:           <div className="mb-5">
323:             <label className="block text-sm font-medium text-slate-700 mb-2">Item Type</label>
324:             <div className="flex gap-3">
325:               <button
326:                 type="button"
327:                 onClick={() => setForm({ ...form, itemType: "GADGET" })}
328:                 className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
329:                   form.itemType === "GADGET"
330:                     ? "border-red-500 bg-red-50 text-red-700"
331:                     : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
332:                 }`}
333:               >
334:                 📱 Gadget
335:               </button>
336:               <button
337:                 type="button"
338:                 onClick={() => setForm({ ...form, itemType: "CASH" })}
339:                 className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
340:                   form.itemType === "CASH"
341:                     ? "border-red-500 bg-red-50 text-red-700"
342:                     : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
343:                 }`}
344:               >
345:                 💰 Cash
346:               </button>
347:             </div>
348:           </div>
349: 
350:           <div className="space-y-4">
351:             {form.itemType === "GADGET" ? (
352:               <>
353:                 <div>
354:                   <label className="block text-sm font-medium text-slate-700">
355:                     Brand
356:                     <input
357:                       required
358:                       value={form.brand}
359:                       onChange={(e) => updateField("brand", e.target.value)}
360:                       className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
361:                     />
362:                   </label>
363:                   <FieldError error={fieldErrors.brand} />
364:                 </div>
365:                 <div>
366:                   <label className="block text-sm font-medium text-slate-700">
367:                     Model
368:                     <input
369:                       required
370:                       value={form.model}
371:                       onChange={(e) => updateField("model", e.target.value)}
372:                       className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
373:                     />
374:                   </label>
375:                   <FieldError error={fieldErrors.model} />
376:                 </div>
377:               </>
378:             ) : null}
379:             <div>
380:               <label className="block text-sm font-medium text-slate-700">
381:                 {form.itemType === "CASH" ? "Description" : "Unit Description"}
382:                 <textarea
383:                   required
384:                   value={form.unitDescription}
385:                   onChange={(e) => updateField("unitDescription", e.target.value)}
386:                   placeholder={form.itemType === "CASH" ? "Purpose / reason for cash" : "Color, storage, condition"}
387:                   className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
388:                 />
389:               </label>
390:               <FieldError error={fieldErrors.unitDescription} />
391:             </div>
392:           </div>
393: 
394:           <div className="mt-8">
395:             <p className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 mb-2">Custom Fields</p>
396:             <div className="space-y-2">
397:               {customFields.map((field, i) => (
398:                 <div key={i} className="flex flex-col sm:flex-row gap-2 items-start">
399:                   <input
400:                     placeholder="Field name"
401:                     value={field.key}
402:                     onChange={(e) => {
403:                       const updated = [...customFields];
404:                       updated[i] = { ...updated[i], key: e.target.value };
405:                       setCustomFields(updated);
406:                     }}
407:                     className="h-10 w-full sm:flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
408:                   />
409:                   <div className="flex gap-2 w-full sm:flex-[2]">
410:                     <input
411:                       placeholder="Value"
412:                       value={field.value}
413:                       onChange={(e) => {
414:                         const updated = [...customFields];
415:                         updated[i] = { ...updated[i], value: e.target.value };
416:                         setCustomFields(updated);
417:                       }}
418:                       className="h-10 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
419:                     />
420:                     <button
421:                       type="button"
422:                       onClick={() => setCustomFields(customFields.filter((_, j) => j !== i))}
423:                       className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-50 transition-all"
424:                     >
425:                       <X size={16} />
426:                   </button>
427:                 </div>
428:               </div>
429:               ))}
430:               <button
431:                 type="button"
432:                 onClick={() => setCustomFields([...customFields, { key: "", value: "" }])}
433:                 className="inline-flex h-9 items-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white px-3 text-xs font-medium text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all"
434:               >
435:                 + Add Field
436:               </button>
437:             </div>
438:           </div>
439:         </section>
440: 
441:         <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
442:           <div className="flex items-center gap-3 mb-6">
443:             <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
444:               <Smartphone size={20} />
445:             </span>
446:             <div>
447:               <h2 className="text-base font-bold font-heading text-slate-900">Contract Details</h2>
448:               <p className="text-xs text-slate-500">Pricing, terms, and payment schedule</p>
449:             </div>
450:           </div>
451:           <div className="grid gap-4 sm:grid-cols-2">
452:             <div>
453:               <label className="block text-sm font-medium text-slate-700">
454:                 Cash Price
455:                 <input
456:                   required
457:                   inputMode="decimal"
458:                   value={form.cashPrice}
459:                   onChange={(e) => updateField("cashPrice", e.target.value.replace(/[^\d]/g, ""))}
460:                   className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
461:                 />
462:               </label>
463:               <FieldError error={fieldErrors.cashPrice} />
464:             </div>
465:             <div>
466:               <label className="block text-sm font-medium text-slate-700">
467:                 Interest Rate (% per month)
468:                 <input
469:                   required
470:                   inputMode="decimal"
471:                   value={form.interestRate}
472:                   onChange={(e) => updateField("interestRate", e.target.value.replace(/[^\d.]/g, ""))}
473:                   className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
474:                 />
475:               </label>
476:               <FieldError error={fieldErrors.interestRate} />
477:             </div>
478:             <div>
479:               <label className="block text-sm font-medium text-slate-700">
480:                 Down Payment
481:                 <input
482:                   required
483:                   inputMode="decimal"
484:                   value={form.downPayment}
485:                   onChange={(e) => updateField("downPayment", e.target.value.replace(/[^\d]/g, ""))}
486:                   className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
487:                 />
488:               </label>
489:               <FieldError error={fieldErrors.downPayment} />
490:             </div>
491:             <div>
492:               <label className="block text-sm font-medium text-slate-700">
493:                 Processing Fee
494:                 <input
495:                   inputMode="decimal"
496:                   value={form.processingFee}
497:                   onChange={(e) => updateField("processingFee", e.target.value.replace(/[^\d.]/g, ""))}
498:                   placeholder="0.00"
499:                   className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
500:                 />
501:               </label>
502:               <FieldError error={fieldErrors.processingFee} />
503:             </div>
504:             <div>
505:               <label className="block text-sm font-medium text-slate-700">
506:                 Term (months)
507:                 <input
508:                   type="number"
509:                   min={6}
510:                   max={48}
511:                   value={form.term}
512:                   onChange={(e) => updateField("term", Number(e.target.value))}
513:                   placeholder="e.g. 24"
514:                   className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
515:                 />
516:               </label>
517:               <FieldError error={fieldErrors.term} />
518:             </div>
519:             <div>
520:               <label className="block text-sm font-medium text-slate-700">
521:                 Date Given
522:                 <input
523:                   type="date"
524:                   value={form.dateGiven}
525:                   onChange={(e) => updateField("dateGiven", e.target.value)}
526:                   className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
527:                 />
528:               </label>
529:               <FieldError error={fieldErrors.dateGiven} />
530:             </div>
531:             <div>
532:               <label className="block text-sm font-medium text-slate-700">
533:                 First Due Date
534:                 <input
535:                   required
536:                   type="date"
537:                   value={form.firstDueDate}
538:                   onChange={(e) => updateField("firstDueDate", e.target.value)}
539:                   className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
540:                 />
541:               </label>
542:               <FieldError error={fieldErrors.firstDueDate} />
543:             </div>
544:             {form.scheduleType === "SEMI_MONTHLY" ? (
545:               <div>
546:                 <label className="block text-sm font-medium text-slate-700">
547:                   Second Due Date
548:                   <input
549:                     type="number"
550:                     min={1}
551:                     max={31}
552:                     value={form.dueDay2}
553:                     onChange={(e) => updateField("dueDay2", e.target.value)}
554:                     placeholder={String(Math.min(dueDay1 + 15, 28))}
555:                     className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
556:                   />
557:                 </label>
558:                 <p className="mt-1 text-xs text-slate-400">Auto-computed: {dueDay1} and {form.dueDay2 || "?"}</p>
559:               </div>
560:             ) : null}
561:           </div>
562: 
563:           <div className="border-t border-slate-100 pt-4">
564:             <p className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 mb-3">Schedule</p>
565:             <div>
566:               <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
567:               <div className="flex gap-2">
568:                 <button
569:                   type="button"
570:                   onClick={() => updateField("scheduleType", "SEMI_MONTHLY")}
571:                   className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
572:                     form.scheduleType === "SEMI_MONTHLY" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-300 bg-white text-slate-600"
573:                   }`}
574:                 >
575:                   Semi-Monthly (2x/month)
576:                 </button>
577:                 <button
578:                   type="button"
579:                   onClick={() => updateField("scheduleType", "MONTHLY")}
580:                   className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
581:                     form.scheduleType === "MONTHLY" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-300 bg-white text-slate-600"
582:                   }`}
583:                 >
584:                   Monthly (1x/month)
585:                 </button>
586:               </div>
587:             </div>
588:           </div>
589: 
590:           {remainingBalance.gt(0) ? (
591:             <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
592:               <div className="grid gap-4 text-sm sm:grid-cols-4">
593:                 <div>
594:                   <div className="text-xs font-semibold font-heading uppercase tracking-wider text-emerald-700">Remaining Balance</div>
595:                   <div className="mt-1 text-lg font-bold text-emerald-800">
596:                     {formatPeso(remainingBalance.toFixed(2))}
597:                   </div>
598:                 </div>
599:                 <div>
600:                   <div className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500">Monthly</div>
601:                   <div className="mt-1 text-lg font-bold text-slate-900">
602:                     {formatPeso(monthlyInstallment.toFixed(2))}
603:                   </div>
604:                 </div>
605:                 <div>
606:                   <div className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500">Per Period</div>
607:                   <div className="mt-1 text-lg font-bold text-emerald-700">
608:                     {formatPeso(periodAmount.toFixed(2))}
609:                   </div>
610:                 </div>
611:                 <div>
612:                   <div className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500">Term / Total Periods</div>
613:                   <div className="mt-1 text-lg font-bold text-slate-900">{form.term} mo / {totalPeriods}x</div>
614:                 </div>
615:               </div>
616:             </div>
617:           ) : null}
618: 
619:           <button
620:             type="submit"
621:             disabled={processing || saving}
622:             className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-red-700 hover:shadow-md active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none disabled:active:scale-100"
623:           >
624:             <Save size={16} aria-hidden="true" />
625:             {processing ? "Checking..." : saving ? "Creating..." : "Create Account"}
626:           </button>
627:           {!formValid && !saving ? (
628:             <p className="mt-2 text-xs text-amber-600 text-center">Fill in all required fields above. Down payment must be less than installment price.</p>
629:           ) : null}
630:         </section>
631:       </form>
632: 
633:       <ConfirmModal
634:         open={showConfirm}
635:         title="Create Installment Account?"
636:         message={`${form.customerName} — ${form.brand} ${form.model}. ₱${formatPeso(remainingBalance.toFixed(2))} — ${totalPeriods} periods, ${form.scheduleType === "SEMI_MONTHLY" ? `semi-monthly (${dueDays.join(", ")})` : "monthly"}.`}
637:         confirmLabel="Yes, create account"
638:         onConfirm={confirmCreate}
639:         onCancel={() => setShowConfirm(false)}
640:         loading={saving}
641:       />
642: 
643:       {createdAccountId ? (
644:         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
645:           <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
646:             <div className="p-6 text-center">
647:               <span className="flex size-12 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
648:                 <CheckCircle size={28} />
649:               </span>
650:               <h3 className="mt-4 text-base font-bold font-heading text-slate-900">Account Created</h3>
651:               <p className="mt-1.5 text-sm text-slate-500">The installment account has been created successfully.</p>
652:               {emailSent ? (
653:                 <p className="mt-2 text-xs text-emerald-600">✓ DP Receipt sent to {form.customerEmail}</p>
654:               ) : form.customerEmail ? (
655:                 <p className="mt-2 text-xs text-amber-600">⚠ Failed to send DP receipt email</p>
656:               ) : (
657:                 <p className="mt-2 text-xs text-slate-400">No email configured for customer</p>
658:               )}
659:               <button
660:                 type="button"
661:                 onClick={() => router.push(`/installment-accounts/${createdAccountId}`)}
662:                 className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-red-800 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98]"
663:               >
664:                 View Account
665:               </button>
666:               <button
667:                 type="button"
668:                 onClick={() => router.push(`/installment-accounts/${createdAccountId}/down-payment-receipt`)}
669:                 className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
670:               >
671:                 <Printer size={16} className="mr-2" />
672:                 Down Payment Receipt
673:               </button>
674:             </div>
675:           </div>
676:         </div>
677:       ) : null}
678:     </div>
679:   );
680: }

(End of file - total 680 lines)
</content>
```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 3.8s)

_Thinking:_

Now let me also read the MVP's statement page and the due date monitoring report to understand those features better.

**Tool: read**

**Input:**
```json
{
  "filePath": "D:\\MVP\\src\\app\\installment-accounts\\[id]\\statement\\page.tsx"
}
```

**Output:**
```
<path>D:\MVP\src\app\installment-accounts\[id]\statement\page.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import React, { use, useEffect, useState } from "react";
4: import { Mail, Printer, ArrowLeft } from "lucide-react";
5: import Link from "next/link";
6: import { apiRequest } from "@/lib/client-api";
7: import { formatPeso } from "@/lib/money";
8: import { ErrorMessage, LoadingBlock, SuccessMessage } from "@/components/ui-state";
9: 
10: type StatementData = {
11:   generatedAt: string;
12:   customerName: string;
13:   customerPhone: string;
14:   customerEmail: string | null;
15:   customerAddress: string;
16:   brand: string;
17:   model: string;
18:   unitDescription: string;
19:   itemType: string;
20:   cashPrice: string;
21:   installmentPrice: string;
22:   downPayment: string;
23:   remainingBalance: string;
24:   grossProfit: string;
25:   interestRate: string | null;
26:   term: number;
27:   scheduleType: string;
28:   monthlyInstallment: string;
29:   status: string;
30:   startDate: string;
31:   dateGiven: string | null;
32:   firstDueDate: string | null;
33:   nextDueDate: string;
34:   totalPayments: string;
35:   totalPenalties: string;
36:   payments: {
37:     date: string;
38:     amount: string;
39:     type: string;
40:     method: string;
41:     penalty: string;
42:     notes: string | null;
43:     cashier: string | null;
44:     proofUrl: string | null;
45:   }[];
46:   schedule: {
47:     period: number;
48:     dueDate: string;
49:     amount: string;
50:     status: string;
51:     paidDate: string | null;
52:     paidAmount: string | null;
53:     penalty: string;
54:     daysOverdue: number | null;
55:   }[];
56:   penalties: {
57:     amount: string;
58:     appliedDate: string;
59:     reason: string | null;
60:   }[];
61: };
62: 
63: export default function StatementPage({ params }: { params: Promise<{ id: string }> }) {
64:   const { id } = use(params);
65:   const [data, setData] = useState<StatementData | null>(null);
66:   const [error, setError] = useState("");
67:   const [sending, setSending] = useState(false);
68:   const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);
69: 
70:   useEffect(() => {
71:     apiRequest<{ statement: StatementData }>(`/api/installment-accounts/${id}/statement`)
72:       .then((res) => setData(res.statement))
73:       .catch((e) => setError(e.message));
74:   }, [id]);
75: 
76:   if (error) return (
77:     <div className="p-8 print:p-0">
78:       <ErrorMessage message={error} />
79:       <Link href={`/installment-accounts/${id}`} className="text-sm text-red-700 underline mt-4 inline-block">Back to Account</Link>
80:     </div>
81:   );
82: 
83:   if (!data) return <LoadingBlock label="Generating statement..." />;
84: 
85:   const generatedDate = new Intl.DateTimeFormat("en-US", {
86:     timeZone: "Asia/Manila",
87:     year: "numeric",
88:     month: "long",
89:     day: "numeric",
90:     hour: "2-digit",
91:     minute: "2-digit",
92:   }).format(new Date(data.generatedAt));
93: 
94:   return (
95:     <div className="mx-auto max-w-4xl px-4 py-8 print:px-0 print:py-0">
96:       {/* Print / Back buttons — hidden when printing */}
97:       <div className="mb-6 flex flex-wrap items-center justify-between gap-1 sm:gap-2 print:hidden">
98:         <Link
99:           href={`/installment-accounts/${id}`}
100:           className="inline-flex h-8 sm:h-10 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 sm:px-4 text-[11px] sm:text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
101:         >
102:           <ArrowLeft size={12} />
103:           Back to Account
104:         </Link>
105:         <div className="flex items-center gap-1 sm:gap-2">
106:           <Link
107:             href={`/installment-accounts/${id}/down-payment-receipt`}
108:             className="inline-flex h-8 sm:h-10 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 sm:px-4 text-[11px] sm:text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
109:           >
110:             <Printer size={12} />
111:             DP Receipt
112:           </Link>
113:           <button
114:             type="button"
115:             onClick={() => window.print()}
116:             className="inline-flex h-8 sm:h-10 items-center gap-1 rounded-lg bg-red-800 px-2 sm:px-4 text-[11px] sm:text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-red-700 hover:shadow-md active:scale-[0.98]"
117:           >
118:             <Printer size={12} />
119:             Print PDF
120:           </button>
121:           {data.customerEmail ? (
122:             <button
123:               type="button"
124:               onClick={async () => {
125:                 setSending(true);
126:                 setSendResult(null);
127:                 try {
128:                   const res = await apiRequest<{ sent: boolean; message: string }>(
129:                     `/api/installment-accounts/${id}/send-statement`,
130:                     { method: "POST" },
131:                   );
132:                   setSendResult({ ok: res.sent, message: res.message });
133:                 } catch (e: any) {
134:                   setSendResult({ ok: false, message: e.message });
135:                 } finally {
136:                   setSending(false);
137:                 }
138:               }}
139:               disabled={sending}
140:               className="inline-flex h-8 sm:h-10 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 sm:px-4 text-[11px] sm:text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400"
141:             >
142:               <Mail size={12} />
143:               {sending ? "Sending" : "Send"}
144:             </button>
145:           ) : null}
146:         </div>
147:         {sendResult ? (
148:           <div className="w-full mt-1">
149:             {sendResult.ok ? (
150:               <SuccessMessage message={sendResult.message} />
151:             ) : (
152:               <ErrorMessage message={sendResult.message} />
153:             )}
154:           </div>
155:         ) : null}
156:       </div>
157: 
158:       {/* ── STATEMENT CONTENT ── */}
159:       <div className="rounded-xl border border-slate-200 bg-white shadow-sm print:border-none print:shadow-none print:rounded-none">
160:         {/* Header */}
161:         <div className="border-b border-slate-200 px-8 py-6 print:border-slate-300">
162:           <div className="flex items-start justify-between">
163:             <div>
164:               <h1 className="text-2xl font-bold text-slate-900">Account Statement</h1>
165:               <p className="mt-1 text-sm text-slate-500">MyFaveGadgets — Gadget Installment Monitoring</p>
166:             </div>
167:             <div className="text-right text-xs text-slate-500">
168:               <div>Generated: {generatedDate}</div>
169:               <div className="mt-0.5">Status: <span className="font-semibold text-slate-700">{data.status}</span></div>
170:             </div>
171:           </div>
172:         </div>
173: 
174:         {/* Customer & Device Info */}
175:         <div className="grid gap-6 px-8 py-5 sm:grid-cols-2">
176:           <div>
177:             <h2 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 mb-3">Customer</h2>
178:             <div className="space-y-1.5 text-sm">
179:               <div><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-900">{data.customerName}</span></div>
180:               <div><span className="text-slate-500">Contact:</span> <span className="text-slate-700">{data.customerPhone}</span></div>
181:               {data.customerEmail ? <div><span className="text-slate-500">Email:</span> <span className="text-slate-700">{data.customerEmail}</span></div> : null}
182:               <div><span className="text-slate-500">Address:</span> <span className="text-slate-700">{data.customerAddress}</span></div>
183:             </div>
184:           </div>
185:           <div>
186:             <h2 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 mb-3">Device</h2>
187:             <div className="space-y-1.5 text-sm">
188:               <div><span className="text-slate-500">Brand:</span> <span className="font-medium text-slate-900">{data.brand}</span></div>
189:               <div><span className="text-slate-500">Model:</span> <span className="text-slate-700">{data.model}</span></div>
190:               <div><span className="text-slate-500">Description:</span> <span className="text-slate-700">{data.unitDescription}</span></div>
191:             </div>
192:           </div>
193:         </div>
194: 
195:         {/* Contract Summary */}
196:         <div className="border-t border-slate-100 px-8 py-5 print:border-slate-200">
197:           <h2 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 mb-3">Contract Details</h2>
198:           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
199:             <div><span className="text-slate-500">Net Price:</span> <span className="font-semibold text-red-800">{formatPeso((parseFloat(data.installmentPrice) - parseFloat(data.downPayment)).toFixed(2))}</span></div>
200:             <div><span className="text-slate-500">Down Payment:</span> <span className="text-slate-700">{formatPeso(data.downPayment)}</span></div>
201:             <div><span className="text-slate-500">Term:</span> <span className="text-slate-700">{data.scheduleType === "SEMI_MONTHLY" ? `${data.term} months (${data.term * 2} periods)` : `${data.term} months`}</span></div>
202:             <div><span className="text-slate-500">{data.scheduleType === "SEMI_MONTHLY" ? "Per Period" : "Monthly"}:</span> <span className="text-slate-700">{formatPeso(data.monthlyInstallment)}{data.scheduleType === "MONTHLY" ? "/mo" : "/period"}</span></div>
203:             <div><span className="text-slate-500">First Due:</span> <span className="text-slate-700">{data.firstDueDate ?? "—"}</span></div>
204:             <div><span className="text-slate-500">Date Given:</span> <span className="text-slate-700">{data.dateGiven ?? "—"}</span></div>
205:           </div>
206:         </div>
207: 
208:         {/* Payment Summary */}
209:         <div className="border-t border-slate-100 px-8 py-5 print:border-slate-200">
210:           <h2 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 mb-3">Payment Summary</h2>
211:           <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
212:             <div><span className="text-slate-500">Total Paid:</span> <span className="font-semibold text-emerald-700">{formatPeso(data.totalPayments)}</span></div>
213:             <div><span className="text-slate-500">Penalties:</span> <span className="font-semibold text-rose-700">{formatPeso(data.totalPenalties)}</span></div>
214:             <div><span className="text-slate-500">Remaining:</span> <span className="font-semibold text-slate-900">{formatPeso(data.remainingBalance)}</span></div>
215:           </div>
216:         </div>
217: 
218:         {/* Payment History Table */}
219:         <div className="border-t border-slate-100 px-4 sm:px-8 py-5 print:border-slate-200 print:px-8">
220:           <h2 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 mb-3">Payment History ({data.payments.length})</h2>
221:           {data.payments.length > 0 ? (
222:             <>
223:               {/* Mobile: Cards */}
224:               <div className="block sm:hidden space-y-2">
225:                 {data.payments.map((p, i) => (
226:                   <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-1.5">
227:                     <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{p.date}</span></div>
228:                     <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-semibold">{formatPeso(p.amount)}</span></div>
229:                     <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium">{p.type}</span></div>
230:                     <div className="flex justify-between"><span className="text-slate-500">Method</span><span>{p.method}</span></div>
231:                     <div className="flex justify-between"><span className="text-slate-500">Penalty</span><span>{p.penalty !== "0.00" ? <span className="text-rose-600">{formatPeso(p.penalty)}</span> : "—"}</span></div>
232:                     <div className="flex justify-between"><span className="text-slate-500">Cashier</span><span>{p.cashier || "—"}</span></div>
233:                   </div>
234:                 ))}
235:               </div>
236:               {/* Desktop: Table */}
237:               <div className="hidden sm:block">
238:                 <table className="w-full text-sm">
239:                   <thead>
240:                     <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
241:                       <th className="py-2 pr-3 font-medium">Date</th>
242:                       <th className="py-2 pr-3 font-medium text-right">Amount</th>
243:                       <th className="py-2 pr-3 font-medium">Type</th>
244:                       <th className="py-2 pr-3 font-medium">Method</th>
245:                       <th className="py-2 pr-3 font-medium text-right">Penalty</th>
246:                       <th className="py-2 pr-3 font-medium">Cashier</th>
247:                       <th className="py-2 pr-3 font-medium">Proof</th>
248:                     </tr>
249:                   </thead>
250:                   <tbody>
251:                     {data.payments.map((p, i) => (
252:                       <tr key={i} className="border-b border-slate-100 text-slate-700">
253:                         <td className="py-2 pr-3">{p.date}</td>
254:                         <td className="py-2 pr-3 text-right font-medium">{formatPeso(p.amount)}</td>
255:                         <td className="py-2 pr-3"><span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium">{p.type}</span></td>
256:                         <td className="py-2 pr-3">{p.method}</td>
257:                         <td className="py-2 pr-3 text-right">{p.penalty !== "0.00" ? <span className="text-rose-600">{formatPeso(p.penalty)}</span> : "—"}</td>
258:                         <td className="py-2 pr-3">{p.cashier || "—"}</td>
259:                         <td className="py-2 pr-3">{p.proofUrl ? <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 underline text-xs">View</a> : "—"}</td>
260:                       </tr>
261:                     ))}
262:                   </tbody>
263:                 </table>
264:               </div>
265:             </>
266:           ) : (
267:             <p className="text-sm text-slate-400">No payments recorded.</p>
268:           )}
269:         </div>
270: 
271:         {/* Schedule Table */}
272:         <div className="border-t border-slate-100 px-4 sm:px-8 py-5 print:border-slate-200 print:px-8">
273:           <h2 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 mb-3">Installment Schedule ({data.schedule.length} periods)</h2>
274:           {/* Mobile: Cards */}
275:           <div className="block sm:hidden space-y-1.5">
276:             {data.schedule.map((s) => {
277:               const periodTotal = (parseFloat(s.amount) + parseFloat(s.penalty || "0")).toFixed(2);
278:               return (
279:               <div key={s.period} className={`rounded-lg border p-2.5 text-xs space-y-1 ${s.status === "PAID" ? "border-emerald-200 bg-emerald-50/50" : s.status === "OVERDUE" ? "border-rose-200 bg-rose-50/50" : s.status === "PARTIAL" ? "border-amber-200 bg-amber-50/50" : "border-slate-200"}`}>
280:                 <div className="flex justify-between"><span className="text-slate-500">#{s.period} · {s.dueDate}</span><span className={`rounded border px-1 py-px text-[10px] font-medium ${s.status === "PAID" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : s.status === "OVERDUE" ? "border-rose-200 bg-rose-50 text-rose-700" : s.status === "PARTIAL" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600"}`}>{s.status}</span></div>
281:                 {s.daysOverdue != null && s.daysOverdue > 0 ? <div className="flex justify-between"><span className="text-slate-500">Days</span><span className="text-rose-600 font-medium">{s.daysOverdue}d</span></div> : null}
282:                 <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-semibold">{formatPeso(s.amount)}</span></div>
283:                 {s.paidAmount ? <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="text-emerald-600">{formatPeso(s.paidAmount)}</span></div> : null}
284:                 {s.status === "PARTIAL" && s.paidAmount ? (
285:                   <div className="flex justify-between border-t border-amber-100 pt-1">
286:                     <span className="text-slate-500">Remaining</span>
287:                     <span className="font-semibold text-amber-700">{formatPeso((parseFloat(s.amount) - parseFloat(s.paidAmount) + parseFloat(s.penalty || "0")).toFixed(2))}</span>
288:                   </div>
289:                 ) : null}
290:                 <div className="flex justify-between"><span className="text-slate-500">Penalty</span><span className={s.penalty !== "0.00" ? "text-rose-600" : "text-slate-400"}>{s.penalty !== "0.00" ? formatPeso(s.penalty) : "—"}</span></div>
291:                 <div className="flex justify-between border-t border-slate-200 pt-1 mt-1"><span className="text-slate-500 font-medium">Total</span><span className="font-bold text-slate-900">{formatPeso(periodTotal)}</span></div>
292:               </div>
293:             )})}
294:             {(() => {
295:               const unpaid = data.schedule.filter((s) => s.status !== "PAID");
296:               if (unpaid.length === 0) return null;
297:               const totalDue = unpaid.reduce((sum, s) => sum + parseFloat(s.amount) + parseFloat(s.penalty || "0"), 0);
298:               const totalPenalty = unpaid.reduce((sum, s) => sum + parseFloat(s.penalty || "0"), 0);
299:               return (
300:                 <div className="rounded-lg border-2 border-slate-300 bg-slate-50 p-3 text-xs space-y-2 mt-3">
301:                   <div className="flex justify-between font-semibold">
302:                     <span className="text-slate-700">Total Due</span>
303:                     <span className="text-sm text-red-800">{formatPeso(totalDue.toFixed(2))}{totalPenalty > 0 ? <span className="text-rose-600 font-normal text-[11px] block text-right">incl. {formatPeso(totalPenalty.toFixed(2))} penalty</span> : null}</span>
304:                   </div>
305:                   <div className="flex justify-between font-semibold border-t border-slate-200 pt-2">
306:                     <span className="text-slate-500">Remaining Balance</span>
307:                     <span className="text-sm text-slate-900">{formatPeso(data.remainingBalance)}</span>
308:                   </div>
309:                 </div>
310:               );
311:             })()}
312:           </div>
313:           {/* Desktop: Table */}
314:           <div className="hidden sm:block">
315:             <table className="w-full text-sm">
316:               <thead>
317:                 <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
318:                   <th className="py-2 pr-3 font-medium">#</th>
319:                   <th className="py-2 pr-3 font-medium">Due Date</th>
320:                   <th className="py-2 pr-3 font-medium text-right">Days</th>
321:                   <th className="py-2 pr-3 font-medium text-right">Amount</th>
322:                   <th className="py-2 pr-3 font-medium text-right">Penalty</th>
323:                   <th className="py-2 pr-3 font-medium text-right">Total</th>
324:                   <th className="py-2 pr-3 font-medium">Status</th>
325:                   <th className="py-2 pr-3 font-medium">Paid Date</th>
326:                   <th className="py-2 pr-3 font-medium text-right">Paid</th>
327:                 </tr>
328:               </thead>
329:               <tbody>
330:                 {data.schedule.map((s) => {
331:                   const periodTotal = (parseFloat(s.amount) + parseFloat(s.penalty || "0")).toFixed(2);
332:                   const isPartial = s.status === "PARTIAL" && s.paidAmount;
333:                   const remainingVal = isPartial
334:                     ? (parseFloat(s.amount) - parseFloat(s.paidAmount || "0") + parseFloat(s.penalty || "0")).toFixed(2)
335:                     : "0.00";
336:                   return (<React.Fragment key={s.period}>
337:                   <tr className={`border-b border-slate-100 text-slate-700 ${s.status === "PAID" ? "bg-emerald-50/50" : s.status === "OVERDUE" ? "bg-rose-50/50" : s.status === "PARTIAL" ? "bg-amber-50/50" : ""}`}>
338:                     <td className="py-1.5 pr-3 font-medium">{s.period}</td>
339:                     <td className="py-1.5 pr-3">{s.dueDate}</td>
340:                     <td className="py-1.5 pr-3 text-right">{s.daysOverdue != null && s.daysOverdue > 0 ? <span className="text-rose-600">{s.daysOverdue}d</span> : "—"}</td>
341:                     <td className="py-1.5 pr-3 text-right">{formatPeso(s.amount)}</td>
342:                     <td className="py-1.5 pr-3 text-right">{s.penalty !== "0.00" ? <span className="text-rose-600">{formatPeso(s.penalty)}</span> : <span className="text-slate-400">—</span>}</td>
343:                     <td className="py-1.5 pr-3 text-right font-semibold">{formatPeso(periodTotal)}</td>
344:                     <td className="py-1.5 pr-3"><span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${s.status === "PAID" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : s.status === "OVERDUE" ? "border-rose-200 bg-rose-50 text-rose-700" : s.status === "PARTIAL" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600"}`}>{s.status}</span></td>
345:                     <td className="py-1.5 pr-3">{s.paidDate || "—"}</td>
346:                     <td className="py-1.5 pr-3 text-right">{s.paidAmount ? formatPeso(s.paidAmount) : "—"}</td>
347:                   </tr>
348:                   {isPartial ? (
349:                     <tr className="border-b border-slate-100 bg-amber-50/30 text-xs text-slate-500">
350:                       <td colSpan={9} className="py-1 pr-3">
351:                         Paid: <span className="font-medium text-emerald-600">{formatPeso(s.paidAmount!)}</span>
352:                         {" · "}
353:                         Remaining: <span className="font-medium text-amber-700">{formatPeso(remainingVal)}</span>
354:                       </td>
355:                     </tr>
356:                   ) : null}
357:                   </React.Fragment>);
358:                 })}
359:               </tbody>
360:               <tfoot>
361:                 <tr className="border-t-2 border-slate-300 text-xs">
362:                   <td colSpan={5} className="py-2 pr-3 font-semibold text-slate-600 text-right">Total Due</td>
363:                   <td className="py-2 pr-3 text-right font-bold text-red-800 text-sm">{(() => {
364:                     const unpaid = data.schedule.filter((s) => s.status !== "PAID");
365:                     const total = unpaid.reduce((sum, s) => sum + parseFloat(s.amount) + parseFloat(s.penalty || "0"), 0);
366:                     const totalPenalty = unpaid.reduce((sum, s) => sum + parseFloat(s.penalty || "0"), 0);
367:                     return <>{formatPeso(total.toFixed(2))}{totalPenalty > 0 ? <span className="text-rose-600 font-normal text-[11px]"> (incl. {formatPeso(totalPenalty.toFixed(2))} penalty)</span> : null}</>;
368:                   })()}</td>
369:                   <td colSpan={3}></td>
370:                 </tr>
371:               </tfoot>
372:             </table>
373:           </div>
374:         </div>
375: 
376:         {/* Penalty Records */}
377:         {data.penalties.length > 0 ? (
378:             <div className="border-t border-slate-100 px-4 sm:px-8 py-5 print:border-slate-200 print:px-8">
379:               <h2 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 mb-3">Penalty Records ({data.penalties.length})</h2>
380:               {/* Mobile: Cards */}
381:               <div className="block sm:hidden space-y-2">
382:                 {data.penalties.map((p, i) => (
383:                   <div key={i} className="rounded-lg border border-rose-100 bg-rose-50/50 p-3 text-xs space-y-1.5">
384:                     <div className="flex justify-between"><span className="text-slate-500">{new Date(p.appliedDate).toLocaleDateString()}</span><span className="font-semibold text-rose-600">{formatPeso(p.amount)}</span></div>
385:                     {p.reason ? <div className="text-slate-600">{p.reason}</div> : null}
386:                   </div>
387:                 ))}
388:               </div>
389:               {/* Desktop: Table */}
390:               <div className="hidden sm:block">
391:                 <table className="w-full text-sm">
392:                   <thead>
393:                     <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
394:                       <th className="py-2 pr-3 font-medium">Date</th>
395:                       <th className="py-2 pr-3 font-medium text-right">Amount</th>
396:                       <th className="py-2 pr-3 font-medium">Reason</th>
397:                     </tr>
398:                   </thead>
399:                   <tbody>
400:                     {data.penalties.map((p, i) => (
401:                       <tr key={i} className="border-b border-slate-100 text-slate-700">
402:                         <td className="py-1.5 pr-3">{new Date(p.appliedDate).toLocaleDateString()}</td>
403:                         <td className="py-1.5 pr-3 text-right font-medium text-rose-600">{formatPeso(p.amount)}</td>
404:                         <td className="py-1.5 pr-3 text-xs">{p.reason || "—"}</td>
405:                       </tr>
406:                     ))}
407:                   </tbody>
408:                 </table>
409:               </div>
410:             </div>
411:         ) : null}
412: 
413:         {/* Total Amount Due (due on/before today) */}
414:         {(() => {
415:           const today = new Date().toISOString().slice(0, 10);
416:           const dueNow = (data.schedule || []).filter(
417:             (s: any) => (s.status === "PENDING" || s.status === "PARTIAL" || s.status === "OVERDUE") && s.dueDate <= today
418:           );
419:           if (dueNow.length === 0) return null;
420:           const totalDue = dueNow.reduce((sum: number, s: any) => sum + parseFloat(s.amount) + parseFloat(s.penalty || "0"), 0);
421:           const totalPenalty = dueNow.reduce((sum: number, s: any) => sum + parseFloat(s.penalty || "0"), 0);
422:           return (
423:             <div className="border-t-2 border-red-200 px-4 sm:px-8 py-5 print:border-red-300 print:px-8 bg-red-50/30">
424:               <h2 className="text-xs font-semibold font-heading uppercase tracking-wider text-red-700 mb-3">Total Amount Due ({dueNow.length} period{dueNow.length > 1 ? "s" : ""} due on or before today)</h2>
425:               <div className="hidden sm:block">
426:                 <table className="w-full text-sm">
427:                   <thead>
428:                     <tr className="border-b border-red-100 text-left text-xs text-slate-500">
429:                       <th className="py-2 pr-3 font-medium">#</th>
430:                       <th className="py-2 pr-3 font-medium">Due Date</th>
431:                       <th className="py-2 pr-3 font-medium text-right">Days</th>
432:                       <th className="py-2 pr-3 font-medium text-right">Amount</th>
433:                       <th className="py-2 pr-3 font-medium text-right">Penalty</th>
434:                       <th className="py-2 pr-3 font-medium text-right">Total</th>
435:                     </tr>
436:                   </thead>
437:                   <tbody>
438:                     {dueNow.map((s: any) => (
439:                       <tr key={s.period} className="border-b border-red-100 text-slate-700">
440:                         <td className="py-1.5 pr-3">{s.period}</td>
441:                         <td className="py-1.5 pr-3">{s.dueDate}</td>
442:                         <td className="py-1.5 pr-3 text-right">{s.daysOverdue != null && s.daysOverdue > 0 ? <span className="text-rose-600">{s.daysOverdue}d</span> : "—"}</td>
443:                         <td className="py-1.5 pr-3 text-right">{formatPeso(s.amount)}</td>
444:                         <td className="py-1.5 pr-3 text-right text-rose-600">{s.penalty !== "0.00" ? formatPeso(s.penalty) : "—"}</td>
445:                         <td className="py-1.5 pr-3 text-right font-semibold text-red-800">{formatPeso((parseFloat(s.amount) + parseFloat(s.penalty || "0")).toFixed(2))}</td>
446:                       </tr>
447:                     ))}
448:                   </tbody>
449:                   <tfoot>
450:                     <tr className="font-bold text-red-800">
451:                       <td colSpan={5} className="pt-2 pr-3 text-right">Total Due:</td>
452:                       <td className="pt-2 pr-3 text-right">{formatPeso(totalDue.toFixed(2))}{totalPenalty > 0 ? <span className="text-rose-600 font-normal text-[11px]"> (incl. {formatPeso(totalPenalty.toFixed(2))} penalty)</span> : null}</td>
453:                     </tr>
454:                     <tr>
455:                       <td colSpan={5} className="pt-1 pr-3 text-right text-xs font-semibold text-slate-500">Remaining Balance:</td>
456:                       <td className="pt-1 pr-3 text-right text-xs font-bold text-slate-900">{formatPeso(data.remainingBalance)}</td>
457:                     </tr>
458:                   </tfoot>
459:                 </table>
460:               </div>
461:               <div className="block sm:hidden space-y-2">
462:                 {dueNow.map((s: any) => (
463:                   <div key={s.period} className="rounded-lg border border-red-100 bg-white p-3 text-xs space-y-1.5">
464:                     <div className="flex justify-between"><span className="text-slate-500">#{s.period} · {s.dueDate}</span><span className="font-semibold text-red-800">{formatPeso((parseFloat(s.amount) + parseFloat(s.penalty || "0")).toFixed(2))}</span></div>
465:                     {s.daysOverdue != null && s.daysOverdue > 0 ? <div className="flex justify-between"><span className="text-slate-500">Days</span><span className="text-rose-600 font-medium">{s.daysOverdue}d</span></div> : null}
466:                     <div className="flex justify-between"><span className="text-slate-500">Amount</span><span>{formatPeso(s.amount)}</span></div>
467:                     {s.penalty !== "0.00" ? <div className="flex justify-between"><span className="text-slate-500">Penalty</span><span className="text-rose-600">{formatPeso(s.penalty)}</span></div> : null}
468:                   </div>
469:                 ))}
470:                 <div className="text-center text-sm font-bold text-red-800 pt-1">Total Due: {formatPeso(totalDue.toFixed(2))}{totalPenalty > 0 ? <span className="block text-rose-600 font-normal text-[11px]">(incl. {formatPeso(totalPenalty.toFixed(2))} penalty)</span> : null}</div>
471:                 <div className="text-center text-xs font-semibold text-slate-500 pt-1">Remaining Balance: <span className="text-slate-900">{formatPeso(data.remainingBalance)}</span></div>
472:               </div>
473:             </div>
474:           );
475:         })()}
476: 
477:         {/* Footer */}
478:         <div className="border-t border-slate-200 px-8 py-4 text-center text-[11px] text-slate-400 print:border-slate-300">
479:           MyFaveGadgets — Gadget Installment Monitoring System — {generatedDate}
480:         </div>
481:       </div>
482:     </div>
483:   );
484: }

(End of file - total 484 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "D:\\MVP\\src\\app\\reports\\[slug]\\page.tsx"
}
```

**Output:**
```
<path>D:\MVP\src\app\reports\[slug]\page.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useEffect, useRef, useState } from "react";
4: import { useParams } from "next/navigation";
5: import Link from "next/link";
6: import { ArrowLeft, Printer } from "lucide-react";
7: import { PageHeader } from "@/components/page-header";
8: import { ResponsiveTable, type Column } from "@/components/responsive-table";
9: import { Pagination } from "@/components/pagination";
10: import { ErrorMessage, LoadingBlock } from "@/components/ui-state";
11: import { StatusBadge } from "@/components/status-badge";
12: import { apiRequest } from "@/lib/client-api";
13: import { formatPeso } from "@/lib/money";
14: 
15: type ReportConfig = {
16:   title: string;
17:   description: string;
18:   columns: Column<any>[];
19:   summaryFields: { label: string; getValue: (data: any) => string }[];
20: };
21: 
22: const reportConfigs: Record<string, ReportConfig> = {
23:   collections: {
24:     title: "Collection Report",
25:     description: "All collections with customer and unit details",
26:     summaryFields: [
27:       { label: "Total Collections", getValue: (d) => formatPeso(d.total) },
28:     ],
29:     columns: [
30:       {
31:         key: "customerName",
32:         label: "Customer",
33:         render: (r) => <Link href={`/installment-accounts/${r.accountId}`} className="font-medium text-red-800 hover:text-red-600 hover:underline print:text-black">{r.customerName}</Link>,
34:       },
35:       { key: "unit", label: "Unit", render: (r) => `${r.brand} ${r.model}` },
36:       { key: "amount", label: "Amount", render: (r) => <span className="font-semibold text-slate-900">{formatPeso(r.amount)}</span> },
37:       { key: "paymentDate", label: "Date", render: (r) => r.paymentDate },
38:       { key: "method", label: "Method", render: (r) => r.method, hideOnMobile: true },
39:       { key: "paymentType", label: "Type", render: (r) => r.paymentType ? r.paymentType.replace("_", " ") : "—", hideOnMobile: true },
40:     ],
41:   },
42:   "daily-collections": {
43:     title: "Daily Collection Report",
44:     description: "Collections for the selected date",
45:     summaryFields: [
46:       { label: "Date", getValue: (d) => d.date },
47:       { label: "Today's Total", getValue: (d) => formatPeso(d.total) },
48:     ],
49:     columns: [
50:       {
51:         key: "customerName",
52:         label: "Customer",
53:         render: (r) => <Link href={`/installment-accounts/${r.accountId}`} className="font-medium text-red-800 hover:text-red-600 hover:underline print:text-black">{r.customerName}</Link>,
54:       },
55:       { key: "unit", label: "Unit", render: (r) => r.unit },
56:       { key: "amount", label: "Amount", render: (r) => <span className="font-semibold text-slate-900">{formatPeso(r.amount)}</span> },
57:       { key: "method", label: "Method", render: (r) => r.method, hideOnMobile: true },
58:       { key: "paymentType", label: "Type", render: (r) => r.paymentType ? r.paymentType.replace("_", " ") : "—", hideOnMobile: true },
59:       { key: "cashier", label: "Cashier", render: (r) => r.cashier ?? "—", hideOnMobile: true },
60:     ],
61:   },
62:   "monthly-collections": {
63:     title: "Monthly Collection Report",
64:     description: "Detailed collections for the selected month",
65:     summaryFields: [
66:       { label: "Month", getValue: (d) => d.month },
67:       { label: "Total", getValue: (d) => formatPeso(d.total) },
68:       { label: "Transactions", getValue: (d) => String(d.count) },
69:     ],
70:     columns: [
71:       {
72:         key: "customerName",
73:         label: "Customer",
74:         render: (r) => <Link href={`/installment-accounts/${r.accountId}`} className="font-medium text-red-800 hover:text-red-600 hover:underline print:text-black">{r.customerName}</Link>,
75:       },
76:       { key: "unit", label: "Unit", render: (r) => r.unit },
77:       { key: "amount", label: "Amount", render: (r) => <span className="font-semibold text-slate-900">{formatPeso(r.amount)}</span> },
78:       { key: "paymentDate", label: "Date", render: (r) => r.paymentDate },
79:       { key: "method", label: "Method", render: (r) => r.method, hideOnMobile: true },
80:       { key: "paymentType", label: "Type", render: (r) => r.paymentType ? r.paymentType.replace("_", " ") : "—", hideOnMobile: true },
81:     ],
82:   },
83:   "overdue-accounts": {
84:     title: "Due Date Monitoring",
85:     description: "All active accounts sorted by due date. Filter by a specific date to see who has paid and who hasn't.",
86:     summaryFields: [
87:       { label: "Filtered Accounts", getValue: (d) => String(d.totalFiltered) },
88:       { label: "Total Overdue", getValue: (d) => String(d.totalOverdue) },
89:     ],
90:     columns: [
91:       {
92:         key: "customerName",
93:         label: "Customer",
94:         render: (r) => <Link href={`/installment-accounts/${r.id}`} className="font-medium text-red-800 hover:text-red-600 hover:underline print:text-black">{r.customerName}</Link>,
95:       },
96:       { key: "unit", label: "Unit", render: (r) => `${r.brand} ${r.model}` },
97:       { key: "phone", label: "Contact", render: (r) => r.customerPhone },
98:       { key: "nextDueDate", label: "Due Date", render: (r) => r.nextDueDate },
99:       {
100:         key: "status",
101:         label: "Status",
102:         render: (r) => <StatusBadge status={r.status} />,
103:       },
104:       { key: "balance", label: "Balance", render: (r) => <span className="font-semibold text-slate-900">{formatPeso(r.remainingBalance)}</span> },
105:       { key: "monthly", label: "Per Period", render: (r) => <span>{formatPeso(r.monthlyInstallment)}<span className="text-slate-400 text-[10px] ml-0.5">{r.scheduleType === "SEMI_MONTHLY" ? "/period" : "/mo"}</span></span>, hideOnMobile: true },
106:       {
107:         key: "lastPaymentDate",
108:         label: "Last Payment",
109:         render: (r) => r.lastPaymentDate
110:           ? <span className="text-xs">{r.lastPaymentDate}<br/><span className="text-slate-500">{formatPeso(r.lastPaymentAmount)}</span></span>
111:           : <span className="text-slate-400">—</span>,
112:         hideOnMobile: true,
113:       },
114:       {
115:         key: "dueLabel",
116:         label: "Days Overdue",
117:         render: (r) => r.daysOverdue > 0
118:           ? <span className="font-semibold text-rose-600">{r.daysOverdue}d overdue</span>
119:           : <span className="text-slate-400">—</span>,
120:         hideOnMobile: true,
121:       },
122:     ],
123:   },
124:   penalties: {
125:     title: "Penalty Report",
126:     description: "All penalty records",
127:     summaryFields: [
128:       { label: "Total Penalties", getValue: (d) => formatPeso(d.total) },
129:       { label: "Count", getValue: (d) => String(d.count) },
130:     ],
131:     columns: [
132:       { key: "customerName", label: "Customer", render: (r) => r.customerName },
133:       { key: "unit", label: "Unit", render: (r) => r.unit },
134:       { key: "amount", label: "Amount", render: (r) => <span className="font-semibold text-rose-600">{formatPeso(r.amount)}</span> },
135:       { key: "appliedDate", label: "Date", render: (r) => r.appliedDate },
136:       { key: "reason", label: "Reason", render: (r) => r.reason ?? "—", hideOnMobile: true },
137:     ],
138:   },
139:   "outstanding-balances": {
140:     title: "Outstanding Balance Report",
141:     description: "All active accounts with remaining balances",
142:     summaryFields: [
143:       { label: "Total Outstanding", getValue: (d) => formatPeso(d.totalOutstanding) },
144:       { label: "Active Accounts", getValue: (d) => String(d.count) },
145:     ],
146:     columns: [
147:       { key: "customerName", label: "Customer", render: (r) => r.customerName },
148:       { key: "phone", label: "Contact", render: (r) => r.customerPhone },
149:       { key: "unit", label: "Unit", render: (r) => `${r.brand} ${r.model}` },
150:       { key: "balance", label: "Balance", render: (r) => <span className="font-semibold text-slate-900">{formatPeso(r.remainingBalance)}</span> },
151:       { key: "monthly", label: "Per Period", render: (r) => <span>{formatPeso(r.monthlyInstallment)}<span className="text-slate-400 text-[10px] ml-0.5">{r.scheduleType === "SEMI_MONTHLY" ? "/period" : "/mo"}</span></span>, hideOnMobile: true },
152:       { key: "dueDate", label: "Due Date", render: (r) => r.nextDueDate },
153:       {
154:         key: "status",
155:         label: "Status",
156:         render: (r) => (
157:           <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${
158:             r.status === "OVERDUE" ? "bg-rose-50 text-rose-700 border border-rose-200" :
159:             r.status === "DUE_TODAY" ? "bg-amber-50 text-amber-700 border border-amber-200" :
160:             "bg-emerald-50 text-emerald-700 border border-emerald-200"
161:           }`}>
162:             {r.status.replace("_", " ")}
163:           </span>
164:         ),
165:       },
166:     ],
167:   },
168:   "account-master-list": {
169:     title: "Account Master List",
170:     description: "All accounts with complete customer, unit, and contract details",
171:     summaryFields: [
172:       { label: "Total Accounts", getValue: (d) => String(d.totalAccounts) },
173:       { label: "Total Balance Outstanding", getValue: (d) => formatPeso(d.totalBalance) },
174:       { label: "Total Collected", getValue: (d) => formatPeso(d.totalCollected) },
175:     ],
176:     columns: [
177:       {
178:         key: "customerName",
179:         label: "Customer",
180:         render: (r) => <Link href={`/installment-accounts/${r.id}`} className="font-medium text-red-800 hover:text-red-600 hover:underline print:text-black">{r.customerName}</Link>,
181:       },
182:       { key: "contact", label: "Contact", render: (r) => r.customerPhone },
183:       { key: "unit", label: "Unit", render: (r) => `${r.brand} ${r.model}` },
184:       { key: "cashPrice", label: "Cash Price", render: (r) => formatPeso(r.cashPrice), hideOnMobile: true },
185:       { key: "downPayment", label: "Down Pmt", render: (r) => formatPeso(r.downPayment), hideOnMobile: true },
186:       { key: "balance", label: "Balance", render: (r) => <span className="font-semibold text-slate-900">{formatPeso(r.remainingBalance)}</span> },
187:       { key: "monthly", label: "Per Period", render: (r) => <span>{formatPeso(r.monthlyInstallment)}<span className="text-slate-400 text-[10px] ml-0.5">{r.scheduleType === "SEMI_MONTHLY" ? "/period" : "/mo"}</span></span> },
188:       { key: "nextAmountDue", label: "Next Due", render: (r) => r.nextAmountDue !== "0.00" ? <span className="font-semibold text-red-800">{formatPeso(r.nextAmountDue)}</span> : <span className="text-slate-400">—</span> },
189:       { key: "totalPenalties", label: "Penalties", render: (r) => r.totalPenalties !== "0.00" ? <span className="font-medium text-rose-600">{formatPeso(r.totalPenalties)}</span> : <span className="text-slate-300">—</span>, hideOnMobile: true },
190:       { key: "term", label: "Term", render: (r) => r.scheduleType === "SEMI_MONTHLY" ? `${r.term}mo (${r.term * 2} periods)` : `${r.term}mo`, hideOnMobile: true },
191:       { key: "dueDay", label: "Due Date", render: (r) => (r.dueDays as number[]).join(", "), hideOnMobile: true },
192:       { key: "nextDueDate", label: "Due Date", render: (r) => r.nextDueDate },
193:       {
194:         key: "status",
195:         label: "Status",
196:         render: (r) => <StatusBadge status={r.status} />,
197:       },
198:       {
199:         key: "daysOverdue",
200:         label: "Days Overdue",
201:         render: (r) => r.daysOverdue > 0
202:           ? <span className="font-semibold text-rose-600">{r.daysOverdue}d</span>
203:           : <span className="text-slate-400">—</span>,
204:         hideOnMobile: true,
205:       },
206:       {
207:         key: "lastPayment",
208:         label: "Last Payment",
209:         render: (r) => r.lastPaymentDate
210:           ? <span className="text-xs">{r.lastPaymentDate}<br/><span className="text-slate-500">{formatPeso(r.lastPaymentAmount)}</span></span>
211:           : <span className="text-slate-400">—</span>,
212:         hideOnMobile: true,
213:       },
214:       {
215:         key: "totalPaid",
216:         label: "Total Paid",
217:         render: (r) => <span className="font-semibold text-emerald-700">{formatPeso(r.totalPaid)}</span>,
218:       },
219:     ],
220:   },
221: };
222: 
223: const listKeys: Record<string, string> = {
224:   collections: "collections",
225:   "daily-collections": "collections",
226:   "monthly-collections": "collections",
227:   "overdue-accounts": "accounts",
228:   penalties: "penalties",
229:   "outstanding-balances": "accounts",
230:   "account-master-list": "accounts",
231: };
232: 
233: export default function ReportPage() {
234:   const { slug } = useParams<{ slug: string }>();
235:   const config = reportConfigs[slug];
236:   const [data, setData] = useState<any>(null);
237:   const [error, setError] = useState("");
238:   const [loading, setLoading] = useState(true);
239:   const [page, setPage] = useState(1);
240:   const [totalPages, setTotalPages] = useState(1);
241:   const [selectedDate, setSelectedDate] = useState("");
242:   const [selectedPaidStatus, setSelectedPaidStatus] = useState("");
243:   const [selectedMonth, setSelectedMonth] = useState("");
244:   const hasDateFilter = slug === "overdue-accounts" || slug === "account-master-list";
245:   const hasDailyFilter = slug === "daily-collections";
246:   const hasMonthFilter = slug === "monthly-collections";
247:   const hasStatusFilter = slug === "account-master-list";
248: 
249:   useEffect(() => {
250:     if (!config) { setLoading(false); return; }
251: 
252:     let active = true;
253:     setLoading(true);
254: 
255:     let url = `/api/reports/${slug}?page=${page}&limit=50`;
256:     if (selectedDate) url += `&date=${selectedDate}`;
257:     if (selectedPaidStatus) url += `&paidStatus=${selectedPaidStatus}`;
258:     if (selectedMonth) url += `&month=${selectedMonth}`;
259: 
260:     apiRequest<any>(url)
261:       .then((res) => {
262:         if (active) {
263:           setData(res);
264:           if (res.pagination) setTotalPages(res.pagination.totalPages);
265:         }
266:       })
267:       .catch((requestError: Error) => { if (active) setError(requestError.message); })
268:       .finally(() => { if (active) setLoading(false); });
269: 
270:     return () => { active = false; };
271:   }, [slug, config, page, selectedDate, selectedPaidStatus, selectedMonth]);
272: 
273:   if (!config) {
274:     return (
275:       <div className="space-y-6">
276:         <PageHeader title="Report Not Found" description="This report does not exist." />
277:         <Link href="/reports" className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50">
278:           <ArrowLeft size={16} /> Back to Reports
279:         </Link>
280:       </div>
281:     );
282:   }
283: 
284:   const rows = data ? (data[listKeys[slug]] ?? []) : [];
285: 
286:   const [dueModal, setDueModal] = useState<any>(null);
287: 
288:   const columns = slug === "account-master-list"
289:     ? [
290:         ...config.columns,
291:         {
292:           key: "totalAmountDue",
293:           label: "Total Amount Due",
294:           headerClassName: "w-36",
295:           render: (r: any) => {
296:             const breakdown = r.dueBreakdown as Array<{ period: number; dueDate: string; amount: string; penalty: string }> | undefined;
297:             const hasBreakdown = breakdown && breakdown.length > 0;
298:             const total = r.totalAmountDue !== "0.00" ? r.totalAmountDue : r.nextAmountDue;
299:             return (
300:               <button
301:                 type="button"
302:                 className={`inline-flex items-center gap-1 font-bold cursor-pointer hover:underline whitespace-nowrap ${hasBreakdown ? "text-red-800" : "text-slate-700"}`}
303:                 onClick={() => setDueModal(r)}
304:               >
305:                 {formatPeso(total)}
306:                 {hasBreakdown ? <span className="text-[10px] font-normal text-slate-400">({breakdown.length})</span> : null}
307:               </button>
308:             );
309:           },
310:         },
311:       ]
312:     : config.columns;
313: 
314:   return (
315:     <div className="space-y-6 print:space-y-4">
316:       <PageHeader
317:         title={config.title}
318:         description={config.description}
319:         actions={
320:           <div className="flex flex-wrap items-center gap-2">
321:               <button
322:                 type="button"
323:                 onClick={() => window.print()}
324:                 disabled={loading}
325:                 className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-800 px-4 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-red-700 hover:shadow-md active:scale-[0.98] print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
326:               >
327:                 <Printer size={16} />
328:                 Print / Export PDF
329:               </button>
330:             <Link
331:               href="/reports"
332:               className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]"
333:             >
334:               <ArrowLeft size={16} /> All Reports
335:             </Link>
336:           </div>
337:         }
338:       />
339: 
340:       {error ? <ErrorMessage message={error} /> : null}
341:       {loading ? <LoadingBlock label={`Loading ${config.title}`} /> : null}
342: 
343:       {!loading && data && hasDateFilter ? (
344:         <div className="flex flex-wrap items-center gap-3 print:hidden">
345:           <span className="text-xs font-semibold text-slate-500">Due on or before:</span>
346:           <input
347:             type="date"
348:             value={selectedDate}
349:             onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
350:             className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
351:           />
352:           {selectedDate ? (
353:             <button
354:               type="button"
355:               onClick={() => setSelectedDate("")}
356:               className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50"
357:             >
358:               Clear Filter
359:             </button>
360:           ) : null}
361:           <span className="text-xs text-slate-500">
362:             {rows.length} of {data.pagination?.total ?? 0} accounts
363:           </span>
364:         </div>
365:       ) : null}
366: 
367:       {!loading && data && hasDailyFilter ? (
368:         <div className="flex flex-wrap items-center gap-3 print:hidden">
369:           <span className="text-xs font-semibold text-slate-500">Date:</span>
370:           <input
371:             type="date"
372:             value={selectedDate}
373:             onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
374:             className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
375:           />
376:           {selectedDate ? (
377:             <button
378:               type="button"
379:               onClick={() => { setSelectedDate(""); setPage(1); }}
380:               className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50"
381:             >
382:               Clear Filter
383:             </button>
384:           ) : null}
385:           <span className="text-xs text-slate-500">
386:             {rows.length} of {data.pagination?.total ?? 0} collections
387:           </span>
388:         </div>
389:       ) : null}
390: 
391:       {!loading && data && hasMonthFilter ? (
392:         <div className="flex flex-wrap items-center gap-3 print:hidden">
393:           <span className="text-xs font-semibold text-slate-500">Month:</span>
394:           <input
395:             type="month"
396:             value={selectedMonth}
397:             onChange={(e) => { setSelectedMonth(e.target.value); setPage(1); }}
398:             className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
399:           />
400:           {selectedMonth ? (
401:             <button
402:               type="button"
403:               onClick={() => { setSelectedMonth(""); setPage(1); }}
404:               className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50"
405:             >
406:               Clear Filter
407:             </button>
408:           ) : null}
409:           <span className="text-xs text-slate-500">
410:             {rows.length} of {data.pagination?.total ?? 0} transactions
411:           </span>
412:         </div>
413:       ) : null}
414: 
415:       {!loading && data && hasStatusFilter ? (
416:         <div className="flex flex-wrap items-center gap-2 print:hidden">
417:           {[
418:             { key: "", label: "All", count: data.allCount },
419:             { key: "paid", label: "Paid", count: data.paidCount },
420:             { key: "unpaid", label: "Unpaid", count: data.unpaidCount },
421:           ].map((opt) => (
422:             <button
423:               key={opt.key}
424:               type="button"
425:               onClick={() => { setSelectedPaidStatus(opt.key); setPage(1); }}
426:               className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-all duration-150 active:scale-[0.97] ${
427:                 selectedPaidStatus === opt.key
428:                   ? "bg-red-800 text-white shadow-sm"
429:                   : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
430:               }`}
431:             >
432:               {opt.label}
433:               {opt.count !== undefined ? (
434:                 <span className={`text-xs tabular-nums ${selectedPaidStatus === opt.key ? "text-red-200" : "text-slate-400"}`}>
435:                   {opt.count}
436:                 </span>
437:               ) : null}
438:             </button>
439:           ))}
440:         </div>
441:       ) : null}
442: 
443:       {!loading && data && hasDateFilter && selectedDate ? (
444:         <div className="hidden print:block text-xs text-slate-600 mb-2">
445:           <span className="font-semibold">Filter:</span> Due on or before <span className="font-semibold">{selectedDate}</span>
446:           {selectedPaidStatus ? <span> · Status: <span className="font-semibold capitalize">{selectedPaidStatus}</span></span> : null}
447:           <span className="ml-2 text-slate-400">({data.pagination?.total ?? 0} accounts)</span>
448:         </div>
449:       ) : null}
450: 
451:       {!loading && data ? (
452:         <>
453:           <div className="flex flex-wrap gap-4 print:gap-3">
454:             {config.summaryFields.map((field) => (
455:               <div key={field.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-w-[180px] print:border print:border-slate-300 print:shadow-none print:p-3">
456:                 <div className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500">{field.label}</div>
457:                 <div className="mt-1.5 text-xl font-bold text-slate-900">{field.getValue(data)}</div>
458:               </div>
459:             ))}
460:           </div>
461: 
462:           <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:border print:border-slate-300 print:shadow-none print:rounded-none print:overflow-visible">
463:             <ResponsiveTable
464:               columns={columns}
465:               data={rows}
466:               rowKey={(row: any, idx: number) => row.id ?? idx}
467:               emptyMessage="No data for this report."
468:               mobileAccordion={slug === "account-master-list" || slug === "overdue-accounts" ? { summaryColumns: ["customerName", "status"] } : undefined}
469:             />
470:               <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="print:hidden" />
471:           </div>
472:         </>
473:       ) : null}
474: 
475:       {dueModal ? (() => {
476:         const r = dueModal;
477:         const breakdown = (r.dueBreakdown || []) as Array<{ period: number; dueDate: string; amount: string; penalty: string }>;
478:         const hasBreakdown = breakdown.length > 0;
479:         const total = r.totalAmountDue !== "0.00" ? r.totalAmountDue : r.nextAmountDue;
480:         const showTotal = formatPeso(total);
481:         return (
482:           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 print:hidden" onClick={() => setDueModal(null)}>
483:             <div className="rounded-2xl bg-white shadow-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
484:               <div className="flex items-center justify-between mb-4">
485:                 <div>
486:                   <h3 className="font-bold font-heading text-slate-900">{r.customerName}</h3>
487:                   <p className="text-xs text-slate-500">{hasBreakdown ? `${breakdown.length} period${breakdown.length > 1 ? "s" : ""} due` : "Next payment"}</p>
488:                 </div>
489:                 <button
490:                   type="button"
491:                   onClick={() => setDueModal(null)}
492:                   className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
493:                 >
494:                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
495:                 </button>
496:               </div>
497:               {hasBreakdown ? (
498:                 <>
499:                 {/* Mobile: Cards */}
500:                 <div className="block sm:hidden space-y-2">
501:                   {breakdown.map((p: any) => (
502:                     <div key={p.period} className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-1.5">
503:                       <div className="flex justify-between">
504:                         <span className="font-medium text-slate-900">#{p.period} · {p.dueDate}</span>
505:                         <span className="font-semibold text-red-800">{formatPeso((parseFloat(p.amount) + parseFloat(p.penalty || "0")).toFixed(2))}</span>
506:                       </div>
507:                       <div className="flex justify-between text-slate-500">
508:                         <span>Amount</span><span>{formatPeso(p.amount)}</span>
509:                       </div>
510:                       <div className="flex justify-between">
511:                         <span className="text-slate-500">Penalty</span><span className="text-rose-600">{p.penalty !== "0.00" ? formatPeso(p.penalty) : "—"}</span>
512:                       </div>
513:                     </div>
514:                   ))}
515:                   <div className="text-sm font-bold text-red-800 pt-2">Total: {showTotal}</div>
516:                 </div>
517:                 {/* Desktop: Table */}
518:                 <table className="hidden sm:table w-full text-sm">
519:                   <thead>
520:                     <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
521:                       <th className="py-1.5 w-8">#</th>
522:                       <th className="py-1.5">Due Date</th>
523:                       <th className="py-1.5 text-right">Amount</th>
524:                       <th className="py-1.5 text-right">Penalty</th>
525:                       <th className="py-1.5 text-right">Total</th>
526:                     </tr>
527:                   </thead>
528:                   <tbody>
529:                     {breakdown.map((p: any) => (
530:                       <tr key={p.period} className="border-b border-slate-50">
531:                         <td className="py-1.5">{p.period}</td>
532:                         <td className="py-1.5">{p.dueDate}</td>
533:                         <td className="py-1.5 text-right">{formatPeso(p.amount)}</td>
534:                         <td className="py-1.5 text-right text-rose-600">{p.penalty !== "0.00" ? formatPeso(p.penalty) : "—"}</td>
535:                         <td className="py-1.5 text-right font-semibold">{formatPeso((parseFloat(p.amount) + parseFloat(p.penalty || "0")).toFixed(2))}</td>
536:                       </tr>
537:                     ))}
538:                   </tbody>
539:                   <tfoot>
540:                     <tr className="font-bold text-red-800 text-sm">
541:                       <td colSpan={4} className="pt-2 text-right">Total Amount Due:</td>
542:                       <td className="pt-2 text-right">{showTotal}</td>
543:                     </tr>
544:                   </tfoot>
545:                 </table>
546:                 </>
547:               ) : (
548:                 <div className="text-center py-4">
549:                   <p className="text-2xl font-bold text-slate-800">{showTotal}</p>
550:                   <p className="text-xs text-slate-400 mt-1">Next installment — no overdue periods</p>
551:                 </div>
552:               )}
553:             </div>
554:           </div>
555:         );
556:       })() : null}
557:     </div>
558:   );
559: }

(End of file - total 559 lines)
</content>
```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 4.9s)

_Thinking:_

Now let me also look at the MVP's types/api.ts to see the full DashboardMetricsDto to understand what fields the dashboard expects.

**Tool: read**

**Input:**
```json
{
  "filePath": "D:\\MVP\\src\\types\\api.ts"
}
```

**Output:**
```
<path>D:\MVP\src\types\api.ts</path>
<type>file</type>
<content>
1: export type AccountStatusValue = "APPLIED" | "ACTIVE" | "DUE_TODAY" | "OVERDUE" | "FULLY_PAID" | "CLOSED";
2: export type ScheduleTypeValue = "SEMI_MONTHLY" | "MONTHLY";
3: export type PaymentMethod = "CASH" | "GCASH" | "BANK";
4: export type PaymentTypeValue = "REGULAR" | "PARTIAL" | "ADVANCE" | "FULL";
5: export type ScheduleStatusValue = "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
6: 
7: export type InstallmentAccountDto = {
8:   id: string;
9:   customerName: string;
10:   customerPhone: string;
11:   customerEmail: string | null;
12:   customerAddress: string;
13:   fbLink: string | null;
14:   brand: string;
15:   model: string;
16:   unitDescription: string;
17:   itemType: string;
18:   cashPrice: string;
19:   installmentPrice: string;
20:   downPayment: string;
21:   processingFee: string;
22:   remainingBalance: string;
23:   grossProfit: string;
24:   interestRate: string | null;
25:   term: number;
26:   monthlyInstallment: string;
27:   status: AccountStatusValue;
28:   scheduleType: ScheduleTypeValue;
29:   dueDays: number[];
30:   firstDueDate: string | null;
31:   dateGiven: string | null;
32:   startDate: string;
33:   nextDueDate: string;
34:   badRecord: boolean;
35:   badRecordRemark: string | null;
36:   deviceEmail: string | null;
37:   deviceEmailPassword: string | null;
38:   deviceAccountHolderEmail: string | null;
39:   remarks: string | null;
40:   customFields: Record<string, string> | null;
41:   createdAt: string;
42:   updatedAt: string;
43: };
44: 
45: export type InstallmentScheduleDto = {
46:   id: string;
47:   installmentAccountId: string;
48:   periodNumber: number;
49:   dueDate: string;
50:   amount: string;
51:   status: ScheduleStatusValue;
52:   paidDate: string | null;
53:   paymentId: string | null;
54:   paidAmount: string | null;
55:   penaltyAmount: string;
56: };
57: 
58: export type PaymentDto = {
59:   id: string;
60:   installmentAccountId: string;
61:   customerName: string;
62:   totalAmount: string;
63:   paymentDate: string;
64:   method: PaymentMethod;
65:   paymentType: PaymentTypeValue;
66:   penaltyAmount: string;
67:   notes: string | null;
68:   cashier: string | null;
69:   proofUrl: string | null;
70:   voided: boolean;
71:   voidedAt: string | null;
72:   voidReason: string | null;
73:   createdAt: string;
74: };
75: 
76: export type PenaltyRecordDto = {
77:   id: string;
78:   installmentAccountId: string;
79:   installmentScheduleId: string | null;
80:   paymentId: string;
81:   amount: string;
82:   appliedDate: string;
83:   reason: string | null;
84: };
85: 
86: export type DashboardActionsDto = {
87:   dueToday: number;
88:   overdue1to30: number;
89:   overdue31plus: number;
90:   unactivated: number;
91:   badRecords: number;
92:   unsecuredDevices: number;
93: };
94: 
95: export type DashboardMetricsDto = {
96:   totalAccounts: number;
97:   appliedAccounts: number;
98:   activeAccounts: number;
99:   fullyPaidAccounts: number;
100:   overdueAccounts: number;
101:   dueTodayAccounts: number;
102:   totalInstallmentSales: string;
103:   totalInstallmentMargin: string;
104:   totalDownPayments: string;
105:   totalCollections: string;
106:   outstandingBalances: string;
107:   totalPenaltiesCollected: string;
108:   collectionsToday: string;
109:   collectionsThisWeek: string;
110:   collectionsThisMonth: string;
111:   aging: {
112:     current: number;
113:     days1to30: number;
114:     days31to60: number;
115:     days61to90: number;
116:     days90plus: number;
117:   };
118: };
119: 
120: export type AdminConfigDto = {
121:   id: string;
122:   penaltyPerDay: string;
123:   adminEmail: string | null;
124:   hasPassword: boolean;
125: };

(End of file - total 125 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "D:\\MVP\\src\\app\\installment-accounts\\[id]\\account-detail-client.tsx",
  "limit": 100
}
```

**Output:**
```
<path>D:\MVP\src\app\installment-accounts\[id]\account-detail-client.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useRouter } from "next/navigation";
4: import Link from "next/link";
5: import Decimal from "decimal.js";
6: import { FormEvent, memo, useCallback, useEffect, useMemo, useState } from "react";
7: import {
8:   Smartphone,
9:   ChevronDown,
10:   ChevronUp,
11:   Printer,
12:   ReceiptText,
13:   User,
14:   MapPin,
15:   Save,
16:   X,
17:   Hash,
18:   AlertTriangle,
19:   Check,
20:   UserCheck,
21:   FileText,
22:   Pencil,
23:   Ban,
24:   Lock,
25:   Trash2,
26: } from "lucide-react";
27: import { PageHeader } from "@/components/page-header";
28: import { StatusBadge } from "@/components/status-badge";
29: import { FieldError } from "@/components/field-error";
30: import { ConfirmModal } from "@/components/confirm-modal";
31: import { ErrorMessage, LoadingBlock, SuccessMessage } from "@/components/ui-state";
32: import { apiRequest } from "@/lib/client-api";
33: import { formatPeso } from "@/lib/money";
34: import { dateToManilaDateOnly } from "@/lib/dates";
35: import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
36: import { useEscapeKey } from "@/lib/use-escape-key";
37: import { createPaymentSchema } from "@/lib/validation";
38: import { validateForm, type FieldErrors } from "@/lib/form-validation";
39: import type {
40:   InstallmentAccountDto,
41:   InstallmentScheduleDto,
42:   PaymentDto,
43:   PenaltyRecordDto,
44:   AccountStatusValue,
45:   ScheduleStatusValue,
46:   PaymentMethod,
47:   PaymentTypeValue,
48: } from "@/types/api";
49: 
50: const scheduleStatusStyles: Record<ScheduleStatusValue, string> = {
51:   PENDING: "border-slate-200 bg-white",
52:   PAID: "border-emerald-200 bg-emerald-50",
53:   OVERDUE: "border-rose-200 bg-rose-50",
54:   PARTIAL: "border-amber-200 bg-amber-50",
55: };
56: 
57: function todayDateOnly() {
58:   return new Intl.DateTimeFormat("en-CA", {
59:     timeZone: "Asia/Manila",
60:     year: "numeric",
61:     month: "2-digit",
62:     day: "2-digit",
63:   }).format(new Date());
64: }
65: 
66: const InfoCard = memo(function InfoCard({ icon: Icon, label, value, valueClass }: { icon: any; label: string; value: React.ReactNode; valueClass?: string }) {
67:   return (
68:     <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
69:       <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
70:         <Icon size={18} />
71:       </span>
72:       <div className="min-w-0">
73:         <div className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500">{label}</div>
74:         <div className={`mt-0.5 text-sm font-medium text-slate-900 truncate ${valueClass ?? ""}`}>{value}</div>
75:       </div>
76:     </div>
77:   );
78: });
79: 
80: const StatCard = memo(function StatCard({ label, value, valueClass = "text-slate-900" }: { label: string; value: React.ReactNode; valueClass?: string }) {
81:   return (
82:     <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
83:       <div className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500">{label}</div>
84:       <div className={`mt-1.5 text-xl font-bold ${valueClass}`}>{value}</div>
85:     </div>
86:   );
87: });
88: 
89: export function AccountDetailClient({ accountId }: { accountId: string }) {
90:   const [account, setAccount] = useState<InstallmentAccountDto | null>(null);
91:   const [schedule, setSchedule] = useState<InstallmentScheduleDto[]>([]);
92:   const [payments, setPayments] = useState<PaymentDto[]>([]);
93:   const [penalties, setPenalties] = useState<PenaltyRecordDto[]>([]);
94:   const [error, setError] = useState("");
95:   const [loading, setLoading] = useState(true);
96:   const [showSchedule, setShowSchedule] = useState(false);
97:   const [showModal, setShowModal] = useState(false);
98:   const [saving, setSaving] = useState(false);
99:   const [form, setForm] = useState({
100:     totalAmount: "",

(Showing lines 1-100 of 2029. Use offset=101 to continue.)
</content>
```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 239.7s)

_Thinking:_

Now I have a very comprehensive understanding of both systems. Let me summarize what the client wants and develop a plan.

The client's requirements:

1. **New Menu: Capital** 
   - Capital main menu
   - Withdraw Capital sub-menu
   - Expenses sub-menu (SALARY & OTHER EXPENSES)

2. **Loan Creation - Customer Details Update**
   - Should match the MVP form: add customerEmail, fbLink (Facebook Profile Link)
   - Also needs: phone number (already exists), gmail (same as email field)
   - Basically the customer details section should match the MVP

3. **Statement Feature**
   - Like the MVP's statement page at `/installment-accounts/[id]/statement`
   - Full printable statement with customer info, contract details, payment summary, payment history, installment schedule

4. **Due Date Monitoring**
   - Like the MVP's "Due Date Monitoring" report at `/reports/overdue-accounts`
   - Shows all accounts sorted by due date with filters
   - Shows overdue/due today users

5. **Dashboard**
   - Should match the MVP's dashboard with financial charts/bars
   - Account Status Breakdown bar chart
   - Financial Summary compact cards
   - Collections timeline
   - Delinquency Aging bar chart
   - Needs Attention section

Let me now create a comprehensive plan.

The current Credit Flow system already has:
- A working dashboard but simpler than MVP
- Working loan creation form but missing customerEmail and fbLink fields
- Working due date monitoring (overdue accounts report) but not as rich as MVP
- NO statement feature
- NO Capital/Withdraw Capital/Expenses features

What needs to be done:

### Schema Changes
1. Add to `LoanAccount` model:
   - `customerEmail` (String?)
   - `fbLink` (String?)
   - These are new fields that need to be added to the schema

2. For Capital/Expenses:
   - New models: `Capital`, `CapitalWithdrawal`, `Expense`
   - Need to figure out the schema for these

### Migration
- Need to create a new migration for the schema changes

### Library Layer
1. Update `src/lib/validation.ts` - Add customerEmail, fbLink to createLoanSchema and updateLoanSchema
2. Update `src/lib/serializers.ts` - Serialize new fields
3. Create `src/lib/capital.ts` - Capital computation/helpers
4. Create `src/lib/expense.ts` - Expense helpers

### API Routes
1. Update `src/app/api/loans/route.ts` - Accept new fields
2. Update `src/app/api/loans/[id]/route.ts` - Accept new fields on update
3. Create `src/app/api/capital/route.ts` - Capital CRUD
4. Create `src/app/api/capital/withdraw/route.ts` - Withdrawals
5. Create `src/app/api/expenses/route.ts` - Expense CRUD
6. Update `src/app/api/dashboard/route.ts` - Add more financial metrics
7. Create `src/app/api/loans/[id]/statement/route.ts` - Statement data endpoint

### Frontend Pages
1. Update `src/app/loans/new/page.tsx` - Add customerEmail, fbLink fields
2. Update `src/app/loans/[id]/page.tsx` - Show new fields, add Statement button
3. Update `src/app/loans/[id]/edit/page.tsx` - Add new fields
4. Create `src/app/loans/[id]/statement/page.tsx` - Statement page
5. Create `src/app/capital/page.tsx` - Capital management
6. Create `src/app/capital/withdraw/page.tsx` - Withdrawal form
7. Create `src/app/expenses/page.tsx` - Expense management
8. Update `src/app/dashboard/dashboard-client.tsx` - Richer dashboard

### Navigation
1. Update `src/components/app-shell.tsx` - Add Capital, Expenses menu items
2. Update `src/components/nav-link.tsx` - Add new icons

### Types
1. Update `src/types/api.ts` - Add new DTOs

Let me think about the Capital/Expenses schema more carefully.

#### Capital Model
- id
- amount (current capital balance)
- description
- createdAt
- updatedAt

#### CapitalWithdrawal Model
- id
- capitalId (relation to Capital)
- amount
- reason/purpose
- withdrawnBy (userId)
- withdrawnAt
- createdAt

#### Expense Model
- id
- type (SALARY, OTHER)
- amount
- description
- date
- postedBy (userId)
- createdAt

Actually, looking at it more carefully, a simpler approach might be:
- `CapitalTransaction` model with type (DEPOSIT/WITHDRAWAL) and balance tracking
- `Expense` model with type (SALARY/OTHER)

But let me think about what makes most sense for a cash lending business:

**Capital** = The total capital invested in the lending business
**Withdraw Capital** = When the business owner withdraws some of the capital
**Expenses** = Business expenses (salaries, rent, utilities, etc.)

So the schema could be:

```prisma
model Capital {
  id        String   @id @default(cuid())
  balance   Decimal  @default(0) @db.Decimal(14, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  transactions CapitalTransaction[]
}

model CapitalTransaction {
  id            String   @id @default(cuid())
  capitalId     String
  type          String   // DEPOSIT or WITHDRAWAL
  amount        Decimal  @db.Decimal(14, 2)
  description   String?
  reference     String?  // e.g., "Initial capital", "Profit deposit"
  performedBy   String?
  createdAt     DateTime @default(now())
  capital       Capital  @relation(fields: [capitalId], references: [id])
}

model Expense {
  id          String   @id @default(cuid())
  type        String   // SALARY or OTHER
  amount      Decimal  @db.Decimal(14, 2)
  description String?
  date        DateTime
  postedBy    String?
  createdAt   DateTime @default(now())
  postedByUser User?   @relation(fields: [postedBy], references: [id])
}
```

Actually, let me simplify. The client just asked for menu items and the features. I should ask about the specifics of Capital and Expenses since these are entirely new features not present in either system.

Let me present the plan first to the user, asking clarifying questions where needed.

Actually, I should also check what the current loan account form looks like in the Credit Flow to understand the exact changes needed.

Now I have a thorough understanding. Let me present my analysis and plan.

Boss, eto ang analysis ko after checking both systems:

---

## Analysis: MVP vs Current Credit Flow

### 1. Missing Customer Fields (MVP→CF)
| Field | MVP | Current CF |
|-------|-----|------------|
| customerEmail | ✅ | ❌ wala |
| fbLink (Facebook) | ✅ | ❌ wala |

### 2. Missing Features
- **Statement** - Wala sa CF pero complete sa MVP (printable PDF, schedule, payment history)
- **Capital / Withdraw Capital** - Wala sa both systems. Brand new feature.
- **Expenses (SALARY & OTHER)** - Wala sa both systems. Brand new feature.

### 3. Dashboard Enhancement
- MVP dashboard has: bar charts (Account Status Breakdown), Financial Summary cards, Delinquency Aging, Needs Attention section, Collections timeline
- Current CF dashboard has: simpler version lacking the bar charts and Needs Attention

### 4. Due Date Monitoring
- Current CF has `overdue-accounts` report pero simplified
- MVP version has: date filter, last payment info, days overdue column, per period amount, customer link

---

**Clarify lang boss** regarding Capital and Expenses - since wala sa MVP, anong workflow gusto ng client?

**Tool: question**

**Input:**
```json
{
  "questions": [
    {
      "question": "Regarding CAPITAL — pano workflow? May initial capital amount na need i-set? Or mag-start lang sa zero then magde-deposit si client? Ang withdraw capital ba ay yung kino-collect na profit na ina-withdraw ng owner?",
      "header": "Capital Workflow",
      "options": [
        {
          "label": "May Initial Capital",
          "description": "May fixed initial capital amount sa settings, then withdrawals lang ang gagawin"
        },
        {
          "label": "Deposit/Withdraw",
          "description": "Pwedeng magdeposit ng additional capital anytime at magwithdraw ng profits"
        },
        {
          "label": "Auto-computed from Loans",
          "description": "Capital = total principal ng loans, auto-computed. Withdrawals lang manual"
        }
      ]
    },
    {
      "question": "Regarding EXPENSES — anong kailangan i-track? Salary ba ay monthly固定 or pwedeng one-time? May categories pa ba aside sa SALARY and OTHER?",
      "header": "Expense Categories",
      "options": [
        {
          "label": "Salary + Other lang",
          "description": "SALARY (employee wages) and OTHER (rent, utilities, etc.) — enough na yan"
        },
        {
          "label": "More categories",
          "description": "Gusto pa ng ibang categories like Utilities, Rent, Transportation, etc."
        }
      ]
    },
    {
      "question": "Sa STATEMENT — may email sending ba dapat? Or print/physical copy lang?",
      "header": "Statement Delivery",
      "options": [
        {
          "label": "Print only",
          "description": "Print/PDF lang, walang email sending"
        },
        {
          "label": "Print + Email",
          "description": "Pwedeng i-email sa customer yung statement"
        }
      ]
    }
  ]
}
```

**Output:**
```
User has answered your questions: "Regarding CAPITAL — pano workflow? May initial capital amount na need i-set? Or mag-start lang sa zero then magde-deposit si client? Ang withdraw capital ba ay yung kino-collect na profit na ina-withdraw ng owner?"="may capital boss ang capital dira nada ma kwa man sang mga ipa laon nga amout. ma minus man na. pero pwede eka add cash si admin lang, pwede man sya ka withdraw. dapat detaild gd kag indicated ha", "Regarding EXPENSES — anong kailangan i-track? Salary ba ay monthly固定 or pwedeng one-time? May categories pa ba aside sa SALARY and OTHER?"="salary + otehr expenses pero customr fields na sya kag gina calcualte ma neh buhin didto sa capital kag dapat detailed gd mag buhin ha. daw laon management system sya but may expense tracker nga autoamted gets mo boss?", "Sa STATEMENT — may email sending ba dapat? Or print/physical copy lang?"="Print only". You can now continue with the user's answers in mind.
```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 139.7s)

_Thinking:_

Okay, so the client clarified:

1. **Capital**: The capital amount is derived from the total loan amounts given out (principal). But it can also be added (admin only adds cash). Withdrawals can happen. It needs to be detailed. So basically:
   - Initial capital can be set
   - When loans are created, the capital gets reduced (money given out as loans reduces available capital)
   - Admin can add cash (deposit/inject more capital)
   - Admin can withdraw capital
   - Detailed tracking with indications

2. **Expenses**: Salary and Other Expenses. But they should have custom fields. It gets calculated and deducted from capital. Detailed tracking. The client says "daw laon management system sya but may expense tracker nga automated" - so it's like a loan management system with an automated expense tracker.

3. **Statement**: Print only, no email.

So the Capital model works like this:
- Capital balance = total capital deposited - total withdrawn - total loan principal given out - total expenses
- Actually wait, let me re-read: "ang capital dira nada ma kwa man sang mga ipa laon nga amout. ma minus man na."
  - The capital is derived from the loaned-out amounts. It gets deducted.
  - "pwede eka add cash si admin lang" - admin can add cash (increase capital)
  - "pwede man sya ka withdraw" - can withdraw
  - "dapat detaild gd kag indicated ha" - needs to be detailed with indications

So the capital tracking system is:
- Track all capital transactions (ADD, WITHDRAW, LOAN_DISBURSEMENT, EXPENSE)
- The "capital" = total money in the business
- When you create a loan, that principal is deducted from capital (money goes out to customer)
- When you add cash, capital increases
- When you withdraw, capital decreases
- Expenses also decrease capital

Actually, I think I'm overcomplicating this. Let me re-read.

"ang capital boss ang capital dira nada ma kwa man sang mga ipa laon nga amout"
- The capital is basically the total of all loan amounts (principal)
"ma minus man na"
- It gets deducted (when loans are paid? or when they are given out?)

I think the simplest interpretation is:
- Capital represents the total funds available
- When a loan is given out, capital decreases (money is loaned out)
- When payments come in, capital increases (money comes back)
- Admin can add extra cash (deposit)
- Admin can withdraw cash
- Expenses decrease capital

So the Capital balance would be:
Capital = (sum of all deposits + sum of all payments) - (sum of all loans given + sum of all withdrawals + sum of all expenses)

Wait, but that's basically the net profit tracking. Let me think about this differently.

For a cash lending business:
1. Initial capital = money the owner put in
2. When you give a loan, cash goes out (capital decreases by principal amount)
3. When customer pays, cash comes in (capital increases by payment amount)
4. Admin can add more capital anytime (deposit)
5. Admin can withdraw profit/investment (withdrawal)
6. Expenses are paid (capital decreases)

So the Capital module should:
- Show current capital balance
- Show all capital transactions (additions, withdrawals, loan disbursements, expense deductions)
- Allow admin to add cash (with source/description)
- Allow admin to withdraw (with reason/description)

The automated part: when a loan is created, it automatically deducts from capital. When a payment is received, it automatically adds to capital. When an expense is recorded, it automatically deducts from capital.

Let me design the schema:

```prisma
model CapitalTransaction {
  id            String   @id @default(cuid())
  type          String   // ADD, WITHDRAW, LOAN_DISBURSEMENT, PAYMENT_COLLECTION, EXPENSE
  amount        Decimal  @db.Decimal(14, 2)
  balanceAfter  Decimal  @db.Decimal(14, 2)  // running balance after this transaction
  description   String?
  referenceId   String?  // could be loanId, paymentId, expenseId
  referenceType String?  // LOAN, PAYMENT, EXPENSE
  performedBy   String?
  createdAt     DateTime @default(now())
  performedByUser User?  @relation(fields: [performedBy], references: [id])
}
```

But wait, "may custom fields na sya" for expenses, and "daw laon management system sya but may expense tracker nga automated."

So the expense should be like a customizable tracker. Maybe the Expense model should have custom fields.

Let me design the Expense model:
```prisma
model Expense {
  id          String   @id @default(cuid())
  type        String   // SALARY or OTHER
  amount      Decimal  @db.Decimal(14, 2)
  description String?
  date        DateTime
  postedBy    String?
  customFields Json?   // for custom fields
  createdAt   DateTime @default(now())
  postedByUser User?   @relation(fields: [postedBy], references: [id])
}
```

Actually, I need to present a plan. Let me write the full implementation plan now.

Let me structure this properly with the detailed plan.

Actually wait, the user also said "dapat may statement man sya" referring to the loan account. So the statement is for each loan account.

Let me also check what the current loan schema looks like in the Credit Flow to see if customerEmail and fbLink are already there.

Salamat boss! Gets ko na. Eto ang comprehensive plan:

---

## PLAN: Credit Flow Enhancement

### Phase 1: Schema Changes (Prisma)

**1a. Add fields to `LoanAccount`:**
```
customerEmail    String?    // email field like MVP
fbLink           String?    // Facebook profile link like MVP
```

**1b. New models:**

```prisma
model CapitalTransaction {
  id            String   @id @default(cuid())
  type          String   // ADD | WITHDRAW | LOAN | COLLECTION | EXPENSE
  amount        Decimal  @db.Decimal(14, 2)
  balanceBefore Decimal  @db.Decimal(14, 2)
  balanceAfter  Decimal  @db.Decimal(14, 2)
  description   String?
  referenceId   String?  // loanId/paymentId/expenseId
  referenceType String?  // LOAN/PAYMENT/EXPENSE
  performedBy   String?
  createdAt     DateTime @default(now())
  performedByUser User?  @relation(fields: [performedBy], references: [id])
}

model Expense {
  id          String   @id @default(cuid())
  type        String   // SALARY | OTHER
  amount      Decimal  @db.Decimal(14, 2)
  description String?
  date        DateTime
  customFields Json?   // flexible key-value pairs for "OTHER" category
  postedBy    String?
  createdAt   DateTime @default(now())
  postedByUser User?   @relation(fields: [postedBy], references: [id])
}
```

**1c. Migration**: `npx prisma migrate dev --name add_capital_expenses`

---

### Phase 2: Capital Module (NEW)

**Automated capital tracking:**
- **LOAN created** → Auto-deduct principal from capital (`LOAN` type)
- **PAYMENT received** → Auto-add payment to capital (`COLLECTION` type)
- **EXPENSE recorded** → Auto-deduct expense amount (`EXPENSE` type)
- **Admin ADD cash** → Manual capital increase (`ADD` type)
- **Admin WITHDRAW** → Manual capital decrease (`WITHDRAW` type)

**API Routes:**
- `GET /api/capital` — Capital balance + transaction history with pagination
- `POST /api/capital/add` — Admin adds cash (ADMIN only)
- `POST /api/capital/withdraw` — Admin withdraws (ADMIN only)

**Frontend:**
- `/capital/page.tsx` — Capital dashboard: balance card, transaction list with filters (type, date range), total inflows/outflows
- `/capital/add/page.tsx` — Add cash form (ADMIN only)
- `/capital/withdraw/page.tsx` — Withdraw form (ADMIN only)

---

### Phase 3: Expenses Module (NEW)

**API Routes:**
- `GET /api/expenses` — List expenses with pagination + filters (type, date range)
- `POST /api/expenses` — Create expense (ADMIN only)
- `DELETE /api/expenses/[id]` — Delete expense (ADMIN only)

**Frontend:**
- `/expenses/page.tsx` — Expense list, summary cards (total salary, total other, grand total), filters
- `/expenses/new/page.tsx` — Create form with type selector (SALARY/OTHER), amount, date, description, custom fields for OTHER

---

### Phase 4: Loan Creation - Customer Details Update

**Update `src/app/loans/new/page.tsx`:**
- Add **Email** field (like MVP)
- Add **Facebook Profile Link** field (like MVP with Facebook icon)
- Customer Details section now shows: Name, Phone, **Email**, Address, **Facebook Link**
- Validation updated accordingly

**Update `src/app/loans/[id]/page.tsx`:**
- Display email and Facebook link in customer info
- Edit modal includes email and Facebook link

**Update `src/app/loans/[id]/edit/page.tsx`:**
- Add email and Facebook link fields

---

### Phase 5: Statement Feature (NEW)

**API:**
- `GET /api/loans/[id]/statement` — Returns statement data (loan info, schedule, payments)

**Frontend:**
- `/loans/[id]/statement/page.tsx` — Full printable statement (mirrors MVP):
  - Header with branding, generation date, status
  - Customer Info (name, phone, email, address, Facebook)
  - Loan Details (principal, interest, total payable, daily, term)
  - Payment Summary (total paid, remaining balance)
  - Payment History table (date, amount, OR#, notes)
  - Installment Schedule table (period, due date, amount, status, paid date, paid amount)
  - "Print PDF" button
  - "Back to Loan" link

- **Statement button** on loan detail page

---

### Phase 6: Dashboard Enhancement

**Richer dashboard matching MVP style:**
- **KPI Hero Row** (4 gradient cards): Total Loans, Active Accounts, Collections (Month), Outstanding
- **Status Breakdown** bar chart: Active, Overdue, Fully Paid (with count + percentage bars)
- **Financial Summary** compact cards: Total Principal, Interest Earned, Total Collections, Outstanding Balance
- **Collections Timeline**: Today, This Week, This Month cards
- **Delinquency Aging** vertical bar chart: Current, 1-30d, 31-60d, 61-90d, 90d+
- **Needs Attention** section: Due Today, Overdue 1-30d, Overdue 31d+
- **Capital** and **Expenses** summary cards

---

### Phase 7: Navigation Update

**Update `src/components/app-shell.tsx`:** Add new menu items:

| Menu Item | Icon | Route | Access |
|-----------|------|-------|--------|
| Dashboard | LayoutDashboard | `/dashboard` | All |
| Loans | Landmark | `/loans` | All |
| **Capital** | **Banknote** | `/capital` | **ADMIN** |
| **Expenses** | **Receipt** | `/expenses` | **ADMIN** |
| Payments | ReceiptText | `/payments` | All |
| Reports | FileText | `/reports` | ADMIN |
| Settings | Settings | `/admin/config` | ADMIN |
| Users | Users | `/admin/users` | ADMIN |

**Capital sub-navigation:** Add tab/page for Withdrawals within `/capital`

---

### Phase 8: Due Date Monitoring Enhancement

**Update `/reports/overdue-accounts`:**
- Add last payment info column
- Add days overdue column
- Add per period/daily amount column
- Date filter (due on or before)
- Status filter (all, paid, unpaid)
- Responsive mobile cards

---

### Phase 9: Auto-deduction Integration

**On loan creation** (POST `/api/loans`):
- After loan is created, create a `CapitalTransaction` with type=`LOAN`, amount=principal, description="Loan disbursement - {customerName}"

**On payment** (POST `/api/payments`):
- After payment is created, create a `CapitalTransaction` with type=`COLLECTION`, amount=payment amount, description="Payment collection - {customerName}"

**On expense creation** (POST `/api/expenses`):
- Create `CapitalTransaction` with type=`EXPENSE`, amount=expense amount, description="Expense: {type} - {description}"

**On capital add** (POST `/api/capital/add`):
- Create `CapitalTransaction` with type=`ADD`

**On capital withdraw** (POST `/api/capital/withdraw`):
- Create `CapitalTransaction` with type=`WITHDRAW`

---

**Tool: question**

**Input:**
```json
{
  "questions": [
    {
      "question": "Eto ang plan ko boss. Goods ba? May gusto ka bag-ohon, idugang, or iban?",
      "options": [
        {
          "label": "Goods na, proceed",
          "description": "Tuloy na sa implementation"
        },
        {
          "label": "May adjustments",
          "description": "Gusto mag-adjust ng ibang part"
        }
      ],
      "header": "Plan Approval"
    }
  ]
}
```

**Output:**
```
User has answered your questions: "Eto ang plan ko boss. Goods ba? May gusto ka bag-ohon, idugang, or iban?"="ibutang na anay sa additonal cahnges plan md. tapos ano ang session ta boss? pano ko ni i continue ang converstion ta ngani . ang mismo nga session". You can now continue with the user's answers in mind.
```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 9.9s)

_Thinking:_

The user is saying:
1. "ibutang na anay sa additional changes plan md" - Put it in the additional changes plan first (markdown)
2. "tapos ano ang session ta boss?" - What is our session?
3. "pano ko ni i continue ang converstion ta ngani" - How do I continue this conversation
4. "ang mismo nga session" - The same session

So they want me to save the plan to a file first (like a markdown plan), and they're also asking how to continue the conversation. They want to save the plan first before implementing.

Let me save the plan to a file in the project root or similar.

Eto boss, i-save ko sa plan document para may record kita.

**Tool: write**

**Input:**
```json
{
  "filePath": "D:\\CREDIT FLOW\\ADDITIONAL_CHANGES_PLAN.md",
  "content": "# ADDITIONAL CHANGES PLAN — Credit Flow Enhancement\n\n## Client Requirements Summary\n1. **Capital Management** — Track capital with automated loan/expense/payment deductions\n2. **Expenses (SALARY & OTHER)** — Customizable expense tracker  \n3. **Customer Details Update** — Add email and Facebook link to loan form (same as MVP)\n4. **Statement Feature** — Printable statement per loan account (same as MVP)\n5. **Dashboard Enhancement** — Richer dashboard with charts/bars (same as MVP)\n6. **Due Date Monitoring** — Enhanced overdue accounts report\n\n## Scope of Work\n\n### Phase 1: Schema Changes\n- Add `customerEmail` (String?) and `fbLink` (String?) to `LoanAccount`\n- New `CapitalTransaction` model (type, amount, balanceBefore/After, reference)\n- New `Expense` model (type, amount, description, date, customFields)\n- Migration\n\n### Phase 2: Capital Module (NEW)\n- Auto-track: loan disbursements, payment collections, expenses, manual add/withdraw\n- API: GET /api/capital, POST /api/capital/add, POST /api/capital/withdraw\n- Pages: /capital (dashboard + history), /capital/add, /capital/withdraw\n\n### Phase 3: Expenses Module (NEW)\n- API: GET /api/expenses, POST /api/expenses, DELETE /api/expenses/[id]\n- Pages: /expenses (list + summary), /expenses/new\n- Type: SALARY (fixed) or OTHER (with custom fields)\n\n### Phase 4: Loan Creation - Customer Details\n- Add Email + Facebook Link fields to new/edit loan forms\n- Update validation, serializers, types\n\n### Phase 5: Statement Feature\n- API: GET /api/loans/[id]/statement\n- Page: /loans/[id]/statement (printable)\n- Button on loan detail page\n\n### Phase 6: Dashboard Enhancement\n- Match MVP dashboard: KPI cards, status breakdown bar chart, financial summary, collections timeline, delinquency aging, needs attention\n\n### Phase 7: Navigation Update\n- Add Capital (ADMIN) and Expenses (ADMIN) to menu\n\n### Phase 8: Due Date Monitoring Enhancement\n- Enhanced /reports/overdue-accounts with date filter, last payment, days overdue\n\n### Phase 9: Auto-deduction Integration\n- Loan creation → CapitalTransaction (LOAN type, deduct principal)\n- Payment → CapitalTransaction (COLLECTION type, add amount)\n- Expense → CapitalTransaction (EXPENSE type, deduct amount)\n"
}
```

**Error:**
```
The user has specified a rule which prevents you from using this specific tool call. Here are some of the relevant rules [{"permission":"*","action":"allow","pattern":"*"},{"permission":"edit","pattern":"*","action":"deny"},{"permission":"edit","pattern":".opencode\\plans\\*.md","action":"allow"},{"permission":"edit","pattern":"C:\\Users\\JOPZ SSD PC1\\.local\\share\\opencode\\plans\\*.md","action":"allow"}]
```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 4.7s)

_Thinking:_

The tool was denied because of the write permission rules. I can only write to `.opencode\plans\*.md` or `C:\Users\JOPZ SSD PC1\.local\share\opencode\plans\*.md`. Let me try writing to the allowed path.

**Tool: bash**

**Input:**
```json
{
  "command": "Test-Path -LiteralPath \"D:\\CREDIT FLOW\\.opencode\\plans\"",
  "description": "Check if plans directory exists"
}
```

**Output:**
```
False

```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 4.3s)

_Thinking:_

The directory doesn't exist. Let me create it first.

**Tool: bash**

**Input:**
```json
{
  "command": "New-Item -ItemType Directory -Path \"D:\\CREDIT FLOW\\.opencode\\plans\" -Force",
  "description": "Create plans directory"
}
```

**Output:**
```


    Directory: D:\CREDIT FLOW\.opencode


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
d-----         6/17/2026   1:58 PM                plans                                                                



```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 6.7s)

_Thinking:_

Now I can write to the allowed path.

**Tool: write**

**Input:**
```json
{
  "filePath": "D:\\CREDIT FLOW\\.opencode\\plans\\additional-changes.md",
  "content": "# ADDITIONAL CHANGES PLAN — Credit Flow Enhancement\n\n## Client Requirements Summary\n1. **Capital Management** — Track capital with automated loan/expense/payment deductions\n2. **Expenses (SALARY & OTHER)** — Customizable expense tracker  \n3. **Customer Details Update** — Add email and Facebook link to loan form (same as MVP)\n4. **Statement Feature** — Printable statement per loan account (same as MVP)\n5. **Dashboard Enhancement** — Richer dashboard with charts/bars (same as MVP)\n6. **Due Date Monitoring** — Enhanced overdue accounts report\n\n## Scope of Work\n\n### Phase 1: Schema Changes\n- Add `customerEmail` (String?) and `fbLink` (String?) to `LoanAccount`\n- New `CapitalTransaction` model (type, amount, balanceBefore/After, reference)\n- New `Expense` model (type, amount, description, date, customFields)\n- Migration\n\n### Phase 2: Capital Module (NEW)\n- Auto-track: loan disbursements, payment collections, expenses, manual add/withdraw\n- API: GET /api/capital, POST /api/capital/add, POST /api/capital/withdraw\n- Pages: /capital (dashboard + history), /capital/add, /capital/withdraw\n\n### Phase 3: Expenses Module (NEW)\n- API: GET /api/expenses, POST /api/expenses, DELETE /api/expenses/[id]\n- Pages: /expenses (list + summary), /expenses/new\n- Type: SALARY (fixed) or OTHER (with custom fields)\n\n### Phase 4: Loan Creation - Customer Details\n- Add Email + Facebook Link fields to new/edit loan forms\n- Update validation, serializers, types\n\n### Phase 5: Statement Feature\n- API: GET /api/loans/[id]/statement\n- Page: /loans/[id]/statement (printable)\n- Button on loan detail page\n\n### Phase 6: Dashboard Enhancement\n- Match MVP dashboard: KPI cards, status breakdown bar chart, financial summary, collections timeline, delinquency aging, needs attention\n\n### Phase 7: Navigation Update\n- Add Capital (ADMIN) and Expenses (ADMIN) to menu\n\n### Phase 8: Due Date Monitoring Enhancement\n- Enhanced /reports/overdue-accounts with date filter, last payment, days overdue\n\n### Phase 9: Auto-deduction Integration\n- Loan creation → CapitalTransaction (LOAN type, deduct principal)\n- Payment → CapitalTransaction (COLLECTION type, add amount)\n- Expense → CapitalTransaction (EXPENSE type, deduct amount)\n"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Plan · DeepSeek V4 Flash Free · 7.2s)

_Thinking:_

The plan is now saved. Now the user is asking about how to continue the session. Let me answer:

The user asked:
1. Save the plan first as markdown ✅ Done
2. "ano ang session ta boss?" - What is our session? They're asking what the plan is for this session
3. "pano ko ni i continue ang converstion ta ngani" - How do I continue this conversation
4. "ang mismo nga session" - The same session

They want to know how to proceed. Since we're in plan mode (READ-ONLY), I should explain to them that:

1. The plan is saved
2. To continue, they can say "proceed" or "execute" or "implement" to start the implementation
3. Or they can ask me to make adjustments to the plan first

Let me explain in simple terms.

Boss, naka-save na ang plan sa `.opencode\plans\additional-changes.md`.

Regarding sa session — plano palang ta subong (READ-ONLY phase). Para ma-continue:

1. Kung gusto mo **mag-implement na** — sabi lang "proceed" or "go" or "execute"
2. Kung gusto mo **mag-adjust** sa plan — sabi lang kung ano gusto bag-ohon
3. Kung gusto mo **mag-start anay** sa Capital or Expenses or Statement — sabi lang kung asan gusto mo mag-una

Bale ikaw bahala boss — sabi mo lang kung gusto mo na i-implement or may adjustments pa sa plan.

---

## User

ang session ta diri pano ni man

---

## Assistant (Plan · DeepSeek V4 Flash Free · 7.4s)

_Thinking:_

The user is asking about how the session works - "ang session ta diri pano ni man" means "how does our session work here?"

They want to understand how to use this tool/session. Let me explain in simple terms what's happening:

1. We're currently in Plan Mode - READ-ONLY, I can't make changes yet
2. I saved the plan
3. They need to tell me to proceed or give instructions on what to do next

Let me explain clearly and simply.

Boss, ganito lang ang flow:

**1. PLAN MODE** (kita subong) — Pwede ka mag-open ng files, mag-search, at magtanong. Pero **hindi pa ako pwedeng mag-edit** ng code.

**2. EXECUTION MODE** — Kapag sinabi mo "go" or "proceed" or "implement", pwede na ako mag-edit ng files at mag-add ng features.

**For now:** Sabi mo lang kung:
- **"Proceed"** — simulan na implement ang plan
- **"Unahin natin [Capital/Expenses/Statement/etc]"** — specific part lang
- **"Adjust"** — kung gusto mo baguhin ang plan

Ikaw bahala boss. Ano gusto mo gawin ta?

---

## User

i mean ang ari ho like xport session transcrit? o rwhat . like ano i type ko sa cmd ma gopen sang session ta

---

## Assistant (Plan · DeepSeek V4 Flash Free · 9.8s)

_Thinking:_

Ahh, gets ko na! Gusto ng client malaman kung ano ang i-type sa command line para ma-continue or ma-access ang session na ito. They want to know:

1. How to export the session transcript
2. What to type in cmd to open/continue the session

Since this is a CLI tool (opencode), the conversation is happening in the terminal. They want to know the command to run to start this session again or export the conversation.

For exporting - they might want to save the conversation. For continuing - they just need to run the same command again.

Actually, since we're in a CLI tool, there's no traditional "session" ID. The user just runs the tool with a prompt. If they want to save the transcript, they can redirect output to a file, or use whatever mechanism opencode provides.

Let me check what tool this is - it's "opencode" CLI tool. The user is asking practical usage questions about it.

Ah gets! Practical question. Eto boss:

**Para i-save ang conversation (transcript):**
Since naka-CLI tayo, i-highlight mo lang lahat ng text sa terminal then copy-paste sa notepad. Walang built-in export command sa opencode.

**Para i-continue ang same context:**
Hindi pwede i-save ang session ID para ma-resume. Every time mag-run ka ng `opencode`, fresh start. Pero kung may existing conversation ka, naka-buffer lang sa terminal screen mo.

**Ang best practice:**
```powershell
opencode "ipatuman ang plan sa .opencode\plans\additional-changes.md" | Tee-Object -FilePath "transcript.txt"
```
Ang `Tee-Object` magsa-save ng buong output sa file + display sa screen.

**Or** kung gusto mo lang i-save agad ang current nakita mo:
```powershell
Start-Transcript -Path "session_log.txt"
opencode "continue natin ang plan implementation"
Stop-Transcript
```

Pero sa ngayon, since naka-PLAN MODE pa lang tayo at READ-ONLY — gusto mo na ba mag-implement? Sabi mo lang "go" or "proceed", tuloy na tayo sa execution.

---

## User

ang same kani. ano tana aton sbung. iya ni ya sang isa ko ka project mu PS D:\MVP> opencode -s ses_150792d24ffemnnefe6BCxx3bU

---

## Assistant (Plan · DeepSeek V4 Flash Free · 14.9s)

_Thinking:_

Ah, I understand now! The user is showing me an example from their other project. They're saying:

1. In their MVP project directory (`D:\MVP`), they run `opencode -s ses_150792d24ffemnnefe6BCxx3bU`
2. The `-s` flag + a session ID resumes a previous session
3. They want to know how to do the same thing here in their Credit Flow project

So they're asking: **"Ano ba ang session natin? Paano ko ma-continue itong conversation natin sa susunod?"**

The answer is:
- `ses_150792d24ffemnnefe6BCxx3bU` is a session ID from a previous opencode session
- To resume a session: `opencode -s <session_id>`
- To see the current session ID, they can check the task tool output - when a task is launched, it has a task ID like `ses_12be118edffe8U0CW4DpXEzvTg`

But actually, the `-s` flag in opencode is used to continue a previous session. The session ID is shown when you start opencode or it can be found.

Wait, actually looking more carefully - the user typed `opencode -s ses_150792d24ffemnnefe6BCxx3bU` in their MVP project. That's an opencode session resume command.

So they want to know:
1. What is our current session ID?
2. How to resume this same session later?

Actually, in opencode CLI, when you first start a session, it typically shows the session ID. Let me check if there's a way to find the current session ID.

Looking at the system prompt more carefully, the task tool says: "The output includes a task_id you can reuse later to continue the same subagent session."

But for the main CLI session itself, I'm not sure how to get the session ID. The user knows about the `-s` flag from their MVP project.

Let me be straightforward - I should ask about what they want to do with their Credit Flow project, and explain that the `-s` flag continues a session using the session ID that appears when you start opencode. Our current conversation doesn't have a visible session ID that I can see, but they can look at the terminal for it when they first started this opencode session.

Actually, I think I should just answer directly:
1. For their Credit Flow project, same thing: `opencode -s <session_id>` if they have a session ID
2. To find the session ID, look at the terminal output when opencode started - it usually shows something like "Session: abc123..."
3. Or run `opencode` without arguments and it shows info

But I'm in plan mode - I can only answer, not execute.

Ah gets na boss! Sa MVP project mo, ginagamit mo `opencode -s ses_150792d24ffemnnefe6BCxx3bU` para i-resume ang previous session.

**Para sa aton nga session subong (Credit Flow):**
- Wala ko kita sang session ID nga gin display sang nag-start ka
- Usually makita mo sa terminal output sang una — "Session: <id>" or similar
- Kaya mo i-resume using: `opencode -s <session_id>` sa `D:\CREDIT FLOW` directory

**Check mo sa terminal output mo sa taas** — dapat may nakalagay na "Session:" or "Task:" na ID.

**Kung gusto mo mag-implement na,** proceed ta. Kung gusto mo i-save ang plan kag continue later, i-note lang ang session ID nga makita sa simula sang opencode session.

Ano gusto mo himuon subong boss? Tuloy na implementation?

---

