# FULL QA AUDIT REPORT — Credit Flow System

**Date:** June 18, 2026  
**Scope:** All layers (Validation, API/Security, UI/Roles, Business Logic, Database)  
**Total Bugs Found:** 45 (7 CRITICAL, 14 HIGH, 16 MEDIUM, 8 LOW)

---

## CRITICAL BUGS (7)

| # | Component | Description | Impact |
|---|-----------|-------------|--------|
| **C1** | `lib/loan-compute.ts:18` | `roundToNearest10` causes **negative last installment** amounts. Rounding to nearest 10 can push daily above rawDaily, making sum of N-1 days exceed totalPayable. Example: ₱5,000 principal, 5%, 150d → last period = **−₱710** | Payment schedule broken for most loans |
| **C2** | `lib/validation.ts:78-83` | `createPaymentSchema` missing `orNumber`. Payments created with NULL OR #. No OR number field in API handler, serializer wasn't including it (now fixed), form has no input. | Impossible to record OR numbers |
| **C3** | `middleware.ts:6-26` | **Zero role-based access control.** Checks only cookie presence, not JWT validity or user role. COLLECTOR can navigate to all admin pages via direct URL. NextAuth middleware pattern not used. | All admin pages accessible to collectors |
| **C4** | `api/dashboard/route.ts:10` | **No auth check at all.** Dashboard API returns all financial metrics to ANY request, even unauthenticated. | All financial data public |
| **C5** | `api/loans/route.ts:124-143` | **No capital sufficiency check.** Loans created even when capital balance = 0 or negative. `balanceAfter = currentBalance - principal` without guard. | Capital goes massively negative |
| **C6** | `api/expenses/route.ts:84-115` | **No capital sufficiency check.** Expenses created regardless of capital balance. Same `minus(amount)` without guard. | Capital goes negative on expenses |
| **C7** | `lib/money.ts:20-22` | `parsePositiveMoney` rejects `"0"`, breaking `processingFee: "0"`. Truthy string check passes `"0"`, then function throws "must be greater than 0". Should use `amount.lt(0)` not `amount.lte(0)`. | Valid zero processing fee rejected |

---

## HIGH BUGS (14)

| # | Component | Description |
|---|-----------|-------------|
| **H1** | `loans/[id]/edit/page.tsx:14-53` | Edit page silently drops `customerEmail` and `fbLink` on save. Form has no fields for these. PUT body omits them. EDIT SAVES WIPE CUSTOMER DATA. |
| **H2** | `lib/loan-compute.ts:5` | `roundToNearest10` uses `toNumber()` — precision loss for large values beyond `Number.MAX_SAFE_INTEGER`. Silent garbage for values > 9 trillion. |
| **H3** | `lib/loan-compute.ts:17` | No division-by-zero guard. `totalPayable.div(0)` throws uncaught `DecimalError`. |
| **H4** | `api/loans/[id]/close/route.ts:28-31` | Force-close marks PARTIAL schedules as PAID without updating `paidAmount`. Creates logically inconsistent rows: `status:PAID, paidAmount:50, amount:100`. |
| **H5** | `api/loans/[id]/route.ts:76-111` | Loan DELETE deletes capital transactions (LOAN + COLLECTION) without creating reversal entries. Capital chain gets gaps; balance history becomes inconsistent. |
| **H6** | `api/payments/route.ts:97-176` | Overpayment inflates capital. Full amount added to capital but only partial applied to loan. Excess disappears from borrower accounting but stays in capital. |
| **H7** | `all capital endpoints` | Concurrent read-modify-write race: both transactions read same `lastCapitalTx`, both write same `balanceBefore` → second overwrites first. No SELECT FOR UPDATE. |
| **H8** | `api/loans/[id]/schedule/route.ts` | **No auth check.** Full schedule (customer + amounts) exposed to unauthenticated requests. |
| **H9** | `api/loans/[id]/payments/route.ts` | **No auth check.** Payment history exposed to unauthenticated requests. |
| **H10** | `api/payments/route.ts:15` | **No auth check on GET.** Payments list exposed to unauthenticated requests. |
| **H11** | `api/loans/[id]/route.ts:15` | **No auth check on GET.** Loan detail (all customer PII + financials) exposed to unauthenticated requests. |
| **H12** | `lib/balance.ts:65-71` | `nextDueDate` not cleared when loan becomes FULLY_PAID. Field retains old stale due date forever. |
| **H13** | `prisma/schema.prisma:85` | `LoanSchedule.paymentId` has **no FK constraint**. Dangling references if payment deleted outside handler. |
| **H14** | `validation.ts:35,55` | `idNumber` has no format validation. Existing `ID_NUMBER_PATTERN` and `isValidIdNumber()` in `field-validation.ts` are completely unused. |

---

## MEDIUM BUGS (16)

| # | Component | Description |
|---|-----------|-------------|
| **M1** | `loans/[id]/page.tsx:195` | Statement button uses `<a>` tag instead of `<Link>` — causes full browser reload instead of SPA navigation |
| **M2** | `dashboard-client.tsx:93` | "New Loan" button visible to COLLECTOR (no `isAdmin` guard). Clicks lead to page where API returns 403 |
| **M3** | `dashboard-client.tsx:210-234` | Capital/Expenses summary cards on dashboard visible to COLLECTOR. Links to admin pages |
| **M4** | `dashboard-client.tsx:264-276` | "Reports & Exports" quick link visible to COLLECTOR |
| **M5** | `loans/new/page.tsx` | Page has NO client-side `isAdmin` guard at all. Only middleware (broken) protects it |
| **M6** | `loans/[id]/edit/page.tsx` | Page has NO client-side `isAdmin` guard. Same issue |
| **M7** | `loans/[id]/page.tsx:103,185` | Modal errors wipe entire page content. Error state replaces all data instead of inline |
| **M8** | `capital/page.tsx`, `expenses/page.tsx`, `loans/page.tsx` | filter/page changes don't reset loading state — stale data shows during fetch |
| **M9** | `loans/new/page.tsx:50-51` | Computation preview uses floating-point math (client) while server uses Decimal.js. Preview may not match saved values |
| **M10** | `loans/new/page.tsx:248` | Clearing termDays sets it to 0 → Infinity/NaN in preview |
| **M11** | `lib/schedule-status.ts:11-18` | Only PENDING (not PARTIAL) schedules marked OVERDUE. Partially-paid overdue periods stay PARTIAL forever, undercounting overdue |
| **M12** | `lib/loan-compute.ts:16` | `processingFee` stored but NOT included in `totalPayable`. Customer never pays the fee |
| **M13** | `api/loans/[id]/close/route.ts:21-25` | Close status check (`FULLY_PAID`) outside transaction — race window exists |
| **M14** | `lib/validation.ts:38` | `interestRate: moneyString` allows values > 999.99 which overflow `DECIMAL(5,2)` — DB-level error |
| **M15** | `lib/validation.ts:87-89` | `termOptions` accepts duplicates like `[30,30,60]` — no uniqueness check |
| **M16** | `lib/validation.ts:4-7` | `moneyString` regex has no max length — values exceeding `DECIMAL(14,2)` pass validation but fail at DB |

---

## LOW BUGS (8)

| # | Component | Description |
|---|-----------|-------------|
| **L1** | `loans/new/page.tsx:77` | No success feedback after loan creation — silent redirect |
| **L2** | `payments/new/page.tsx:55-59` | No success feedback after payment — silent redirect |
| **L3** | `loans/[id]/edit/page.tsx:35` | Silent redirect on fetch error — no error message |
| **L4** | `loans/[id]/page.tsx:297` | "Per Period" label should be "Daily Installment" for consistency |
| **L5** | `loans/[id]/page.tsx:368-383` | Excess payment amount shown twice in schedule table |
| **L6** | `app-shell.tsx:40` | Logo image has no fallback/alt text — broken image box if missing |
| **L7** | `capital/add/page.tsx`, `capital/withdraw/page.tsx` | Amount inputs have no max bound — user can type arbitrarily large numbers |
| **L8** | `api/dashboard/route.ts:74-84` | Aging SQL uses `CURRENT_DATE` (server timezone) not Manila — off by 1 day possible |

---

## CROSS-CUTTING PATTERNS

### Pattern 1: Missing Authentication (5 endpoints)
`api/dashboard`, `api/payments GET`, `api/loans/[id] GET`, `api/loans/[id]/schedule GET`, `api/loans/[id]/payments GET` — all missing `await auth()`.

### Pattern 2: roundToNearest10 is Fundamentally Broken
Produces negative last installments, zero daily amounts, precision loss for large values. Should be replaced with `ROUND_FLOOR` per AGENTS.md spec.

### Pattern 3: Capital Balance Has No Guards
Only manual WITHDRAW checks for insufficient balance. Loan creation, expense creation silently drive capital negative.

### Pattern 4: COLLECTOR Role UI Leaks
Dashboard shows admin buttons/cards. Admin pages have no client-side guards. Broken middleware means collectors reach pages they shouldn't.

### Pattern 5: orNumber Dead Code
Column exists in DB, but: no Zod schema field, no form input, no API handler field. Was partially added to DTO/serializer in previous session but still not functional.

---

## FIX PRIORITY ORDER

1. **C1:** Fix `roundToNearest10` → replace with `ROUND_FLOOR` or remove rounding entirely
2. **C7:** Fix `parsePositiveMoney` zero rejection
3. **C4, H8-H11:** Add `auth()` checks to 5 unprotected GET endpoints
4. **C3:** Fix middleware to use NextAuth `auth()` wrapper with role check
5. **C5, C6:** Add capital sufficiency check before loan/expense creation
6. **C2:** Add `orNumber` to createPaymentSchema + payment form + API handler
7. **H1:** Add email/fbLink fields to edit page
8. **H4:** Fix close endpoint to not mark PARTIAL as PAID
9. **H5:** Fix loan DELETE to create reversal entries instead of deletion
10. **H6:** Handle overpayment (reject or track excess)
11. **H7:** Fix concurrent capital writes with SELECT FOR UPDATE or optimistic locking
12. **M1-M7:** Add client-side role guards on dashboard and admin pages
13. **M11:** Fix PARTIAL schedules re-marked OVERDUE when past due
14. **M14-M16:** Add max value checks to validation schemas
15. **L1-L8:** Polish items
