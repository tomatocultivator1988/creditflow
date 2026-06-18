# SYSTEM FLOW — Credit Flow (JBV Credit Collection Services)

## Role-Based Access Summary

| Feature | ADMIN | COLLECTOR |
|---------|-------|-----------|
| Dashboard view | ✅ | ✅ |
| View Loans list + detail | ✅ | ✅ |
| Create Loan | ✅ | ❌ |
| Edit Loan | ✅ | ❌ |
| Close Loan | ✅ | ❌ |
| Delete Loan | ✅ | ❌ |
| Upload Photo | ✅ | ❌ |
| Post Payment | ✅ | ✅ |
| View Payments | ✅ | ✅ |
| Statement view/print | ✅ | ✅ |
| Capital Management | ✅ | ❌ |
| Expense Management | ✅ | ❌ |
| Reports | ✅ | ❌ |
| Settings (Config) | ✅ | ❌ |
| User Management | ✅ | ❌ |

---

## ACTIVITY DIAGRAMS

### A. LOGIN FLOW

```
┌─────────────┐
│  /login     │
│  Email + PW │
└──────┬──────┘
       │ signIn("credentials")
       ▼
   Valid?
   ├── NO  → Error "Invalid credentials"
   └── YES → JWT session created
              │
              ▼
         /dashboard
              │
         ┌────┴────┐
         ▼         ▼
      ADMIN    COLLECTOR
         │         │
    [Full Menu]  [Limited Menu]
```

---

### B. ADMIN — COMPLETE WORKFLOW MAP

```
LOGIN (admin@jbvcredit.com / admin123)
│
├── DASHBOARD ──────────────────────
│   │
│   ├── [New Loan] ──────────────────────┐
│   │   POST /api/loans                   │
│   │   → CapitalTx(type:LOAN, -principal)│
│   │                                      │
│   ├── [View All Loans] ───┐             │
│   ├── [Payment Records]   │             │
│   ├── [Reports & Exports] │             │
│   ├── [Capital Balance]   │             │
│   ├── [Total Expenses]    │             │
│   └── [Needs Attention]   │             │
│                           ▼             │
├── LOANS LIST (/loans)◄────┘             │
│   │                                     │
│   ├── [New Loan] → Modal form           │
│   │   POST /api/loans                   │
│   │                                     │
│   ├── Search + Status Filter            │
│   │                                     │
│   └── [View] per row ──────────────────┐│
│                                        ▼│
├── LOAN DETAIL (/loans/[id])◄───────────┘│
│   │                                     │
│   ├── [Statement] → /loans/[id]/statement
│   │   Read-only printable document       │
│   │                                     │
│   ├── [Edit] → Modal                     │
│   │   PUT /api/loans/[id]               │
│   │   (name, phone, email, address,      │
│   │    fbLink, idNumber, validIdType,    │
│   │    remarks)                          │
│   │                                     │
│   ├── [Close] (if not FULLY_PAID)       │
│   │   POST /api/loans/[id]/close        │
│   │   → Marks all unpaid schedules PAID  │
│   │   → Status = FULLY_PAID             │
│   │   → No capital impact               │
│   │                                     │
│   ├── [Delete] → ConfirmModal            │
│   │   DELETE /api/loans/[id]            │
│   │   → Cleans CapitalTx(LOAN+COLLECTION)│
│   │   → Deletes payments, schedules, loan│
│   │   → Redirects to /loans              │
│   │                                     │
│   ├── [Post Payment] → Modal             │
│   │   POST /api/payments                │
│   │   → FIFO apply to schedules          │
│   │   → CapitalTx(type:COLLECTION, +amt) │
│   │   → Recalculate balance + status     │
│   │                                     │
│   └── [Photo] (file upload)             │
│       POST /api/loans/[id]/upload-photo │
│                                       │
├── PAYMENTS LIST (/payments)           │
│   │                                   │
│   ├── View all payments (paginated)    │
│   ├── Customer links → Loan Detail    │
│   └── [New Payment] → /payments/new    │
│       │                               │
│       └── Select Loan dropdown         │
│           → Fill Amount, Date, Notes   │
│           → POST /api/payments        │
│           → CapitalTx(type:COLLECTION) │
│                                       │
├── CAPITAL (/capital) ────────ADMIN ONLY
│   │
│   ├── View Capital Balance + History
│   ├── Filter by type (ADD|WITHDRAW|LOAN|COLLECTION|EXPENSE)
│   │
│   ├── [Add Cash] → /capital/add
│   │   → Amount + Description
│   │   → POST /api/capital {_action:"add"}
│   │   → CapitalTx(type:ADD, +amount)
│   │
│   └── [Withdraw] → /capital/withdraw
│       → Amount + Description
│       → POST /api/capital {_action:"withdraw"}
│       → CapitalTx(type:WITHDRAW, -amount)
│       → BLOCKS if amount > balance
│
├── EXPENSES (/expenses) ──────ADMIN ONLY
│   │
│   ├── View Expenses List + Summary
│   │   (Salary Total | Other Total | Grand Total)
│   ├── Filter by type (ALL|SALARY|OTHER)
│   │
│   └── [New Expense] → /expenses/new
│       → Type: SALARY or OTHER
│       → Amount + Description + Date
│       → If OTHER: custom fields (key-value pairs)
│       → POST /api/expenses
│       → CapitalTx(type:EXPENSE, -amount)
│
├── REPORTS (/reports) ─────────ADMIN ONLY
│   │
│   ├── Daily Collections → /reports/daily-collections
│   │   Date picker → table + CSV/Print
│   │
│   ├── Monthly Collections → /reports/monthly-collections
│   │   Year picker → 12-month table + CSV/Print
│   │
│   ├── Due Date Monitoring → /reports/overdue-accounts
│   │   Date filter (Due on or before) + CSV/Print
│   │
│   └── Outstanding Balances → /reports/outstanding-balances
│       Active/Overdue loans + CSV/Print
│
├── SETTINGS (/admin/config) ───ADMIN ONLY
│   │
│   └── Default Interest Rate + Term Options
│       → PUT /api/admin/config
│
└── USER MGMT (/admin/users) ───ADMIN ONLY
    │
    ├── User list table
    └── [Add User] → Modal
        → Name + Email + Password + Role
        → POST /api/admin/users
```

---

### C. COLLECTOR — COMPLETE WORKFLOW MAP

```
LOGIN (collector@jbvcredit.com / collector123)
│
├── DASHBOARD ────────────────
│   │
│   ├── View all KPI metrics
│   ├── View Status Breakdown bars
│   ├── View Financial Summary
│   ├── View Collections timeline
│   ├── View Delinquency Aging
│   ├── View Needs Attention
│   ├── [New Loan] visible but API blocked
│   └── [Reports & Exports] visible but API blocked
│
├── LOANS LIST (/loans) ──────
│   │
│   ├── Search + Status filter
│   ├── [New Loan] BUTTON HIDDEN
│   └── [View] per row ───┐
│                         ▼
├── LOAN DETAIL (/loans/[id])
│   │
│   ├── [Statement] → view/print
│   ├── [Edit] BUTTON HIDDEN
│   ├── [Close] BUTTON HIDDEN
│   ├── [Delete] BUTTON HIDDEN
│   ├── [Photo] upload HIDDEN
│   └── [Post Payment] ✅
│       → POST /api/payments
│       → FIFO apply to schedules
│       → CapitalTx(type:COLLECTION)
│
├── PAYMENTS LIST (/payments) ─
│   │
│   ├── View all payments
│   └── [New Payment] ✅
│       → Select Loan + Amount + Date + Notes
│       → POST /api/payments
│
├── CAPITAL ──── NAV LINK HIDDEN
├── EXPENSES ─── NAV LINK HIDDEN
├── REPORTS ──── NAV LINK HIDDEN
├── SETTINGS ─── NAV LINK HIDDEN
└── USERS ────── NAV LINK HIDDEN
```

---

### D. CAPITAL TRACKING — AUTOMATED FLOW

```
CAPITAL BALANCE CHAIN
═══════════════════════════════════════

Initial State: balance = 0

[ADD] Admin adds cash
  └─ balance = balance + amount

[LOAN] Loan created (auto on POST /api/loans)
  └─ balance = balance - principal
  └─ referenceId = loan.id

[COLLECTION] Payment received (auto on POST /api/payments)
  └─ balance = balance + paymentAmount
  └─ referenceId = payment.id

[EXPENSE] Expense recorded (auto on POST /api/expenses)
  └─ balance = balance - expenseAmount
  └─ referenceId = expense.id

[WITHDRAW] Admin withdraws (POST /api/capital {_action:"withdraw"})
  └─ balance = balance - amount
  └─ BLOCKED if amount > balance

[LOAN DELETE] Deletes LOAN + COLLECTION CapitalTxs
  └─ Cleanup in DELETE /api/loans/[id]

[LOAN CLOSE] No capital impact
  └─ Only status change, no money moves

Each CapitalTransaction stores:
  - balanceBefore (chain integrity check)
  - balanceAfter (current running balance)
  - type, amount, description, reference
```

---

### E. PAYMENT POSTING FLOW (DETAILED)

```
POST /api/payments
│
├── 1. Fetch loan + schedules
├── 2. Validate: exists, not FULLY_PAID
├── 3. Mark overdue: PENDING schedules past due → OVERDUE
├── 4. FIFO Apply to unpaid schedules:
│   │
│   │  For each non-PAID period:
│   │    remainingPeriod = amount - alreadyPaid
│   │    if payment >= remainingPeriod:
│   │      → status = PAID, paidAmount = full
│   │    else:
│   │      → status = PARTIAL, paidAmount = partial
│   │    payment -= applied
│   │    if payment <= 0: stop
│   │
├── 5. Create Payment record
├── 6. Update Schedule records
├── 7. recalculateBalance():
│   │  sum unpaid = Σ(amount - paidAmount) for non-PAID
│   │  newBalance = 0 → FULLY_PAID
│   │  nextDueDate < today → OVERDUE
│   │  else → ACTIVE
│   │
├── 8. CapitalTx(type:COLLECTION, +fullAmount) ← inside $transaction
│
└── 9. Return success
    (withRetry on P2034 deadlock, up to 3 retries)
```

---

### F. LOAN LIFECYCLE FLOW

```
CREATE LOAN (POST /api/loans)
│
├── 1. Validate schema
├── 2. Compute: interestAmount, totalPayable, dailyInstallment
├── 3. Generate daily schedule (1 row per day)
├── 4. $transaction:
│   ├── Create LoanAccount + Schedule rows
│   └── CapitalTx(type:LOAN, -principal) ← inside tx
│
▼ ACTIVE status
│
├── Payments posted → reduce remainingBalance
├── If remaining = 0 → FULLY_PAID
├── If due date passes → OVERDUE (via updateOverdueSchedule)
│
├── CLOSE (POST /api/loans/[id]/close)
│   └── Force all unpaid schedules → PAID
│   └── Status → FULLY_PAID, balance → 0
│   └── No CapitalTx created
│
└── DELETE (DELETE /api/loans/[id])
    └── Clean CapitalTxs (LOAN + COLLECTION)
    └── Delete payments, schedules, loan
    └── Redirect to /loans
```

---

### G. NAVIGATION STRUCTURE

```
AppShell (persistent)
│
├── HEADER (desktop, sticky)
│   ├── Logo → /dashboard
│   ├── Dashboard   → /dashboard        [ALL]
│   ├── Loans       → /loans            [ALL]
│   ├── Payments    → /payments         [ALL]
│   ├── Capital     → /capital          [ADMIN ONLY]
│   ├── Expenses    → /expenses         [ADMIN ONLY]
│   ├── Reports     → /reports          [ADMIN ONLY]
│   ├── Settings    → /admin/config     [ADMIN ONLY]
│   ├── Users       → /admin/users      [ADMIN ONLY]
│   └── Logout (signOut → /login)
│
└── BOTTOM NAV (mobile, fixed)
    └── Same links + Logout
```

---

### H. API ENDPOINTS — COMPLETE LIST

| Method | Endpoint | Auth | Auto CapitalTx |
|--------|----------|------|----------------|
| GET | `/api/dashboard` | Session | — (reads balance) |
| GET | `/api/loans` | None | — |
| POST | `/api/loans` | ADMIN | LOAN (-principal) |
| GET | `/api/loans/[id]` | None | — |
| PUT | `/api/loans/[id]` | ADMIN | — |
| DELETE | `/api/loans/[id]` | ADMIN | Cleans LOAN+PAYMENT txs |
| GET | `/api/loans/[id]/schedule` | None | — |
| GET | `/api/loans/[id]/payments` | None | — |
| GET | `/api/loans/[id]/statement` | Session | — |
| POST | `/api/loans/[id]/close` | ADMIN | — |
| POST | `/api/loans/[id]/upload-photo` | ADMIN | — |
| GET | `/api/payments` | Session | — |
| POST | `/api/payments` | Session | COLLECTION (+amount) |
| GET | `/api/capital` | ADMIN | — |
| POST | `/api/capital` | ADMIN | ADD/WITHDRAW (±amount) |
| GET | `/api/expenses` | ADMIN | — |
| POST | `/api/expenses` | ADMIN | EXPENSE (-amount) |
| GET | `/api/reports/daily-collections` | ADMIN | — |
| GET | `/api/reports/monthly-collections` | ADMIN | — |
| GET | `/api/reports/outstanding-balances` | ADMIN | — |
| GET | `/api/reports/overdue-accounts` | ADMIN | — |
| GET | `/api/admin/config` | ADMIN | — |
| PUT | `/api/admin/config` | ADMIN | — |
| GET | `/api/admin/users` | ADMIN | — |
| POST | `/api/admin/users` | ADMIN | — |
| GET/POST | `/api/auth/[...nextauth]` | Public | — |
