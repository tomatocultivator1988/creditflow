# Payroll + Attendance Plan — JBV Credit Flow

## Business Context

- **7 days/week** — field collectors work daily (including Sundays)
- **Fixed base salary** per collector, not commission-based
- **Attendance tracking** — daily marking (Present / Absent / Half-Day)
- **Payroll report** — auto-compute deductions based on absences

---

## Schema Changes

### New Model: `Attendance`

```prisma
model Attendance {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime
  status    String   // PRESENT | ABSENT | HALF_DAY
  notes     String?
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, date])
  @@index([date])
}
```

### Add to `User`:

```prisma
model User {
  // ... existing fields ...
  monthlySalary   Decimal     @default(500.00) @db.Decimal(14, 2)
  attendances     Attendance[]
}
```

**Migration:** `npx prisma migrate dev --name add_attendance_payroll`

---

## API Routes

### `GET /api/attendance` — List attendance
- Query params: `userId`, `from`, `to`
- Admin only

### `POST /api/attendance` — Mark single attendance
- Body: `{ userId, date, status, notes? }`
- Upsert (create or update if exists for same date+user)
- Admin only

### `POST /api/attendance/batch` — Batch mark for a day
- Body: `{ date, entries: [{ userId, status, notes? }] }`
- Marks all collectors for one day at once
- Admin only

### `GET /api/reports/payroll` — Payroll report
- Query params: `from`, `to`
- Admin only
- Returns per-collector computation:
```json
{
  "period": { "from": "2026-06-01", "to": "2026-06-15", "totalDays": 15 },
  "entries": [
    {
      "userId": "...",
      "collectorName": "Juan dela Cruz",
      "monthlySalary": "7500.00",
      "daysPresent": 14,
      "daysAbsent": 1,
      "daysHalf": 0,
      "deduction": "500.00",
      "netPay": "7000.00",
      "collectionsTotal": "45000.00"   // total amount collected in period
    }
  ]
}
```

### Payroll Computation Logic
```
totalDays = count of calendar days between from and to (inclusive)
                OR count of days with attendance records
                OR count of all days in period (including days not yet marked)

Option A (recommended): Count all calendar days. Absence only counted if explicitly marked.
  → If a day has no attendance record, treat as PRESENT (default)

Option B: Only count days that HAVE attendance records.
  → Unmarked days = not counted

Recommendation: Option A — simpler, collector is assumed present unless marked absent.

dailyRate = monthlySalary / totalDays
deduction = (absentDays + halfDays * 0.5) * dailyRate
netPay = monthlySalary - deduction
```

---

## Frontend Pages

### 1. Attendance Page (`/attendance`) — Admin Only

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Attendance                                              │
│                                                         │
│  ┌────────────────┐  ┌─────────────────────┐            │
│  │ Date picker    │  │ [Mark All Present]  │            │
│  └────────────────┘  └─────────────────────┘            │
│                                                         │
│  Date: 2026-06-23           [< Prev Day] [Next Day >]   │
│                                                         │
│  ┌──────────────┬──────────┬──────────┬──────────┐      │
│  │ Collector    │ Status   │ Notes    │ Quick    │      │
│  ├──────────────┼──────────┼──────────┼──────────┤      │
│  │ Juan Cruz    │ ● Present│          │ [Absent] │      │
│  │ Pedro Santos │ ○ Absent │ Sick day │ [Presnt] │      │
│  │ Maria Reyes  │ ◐ Half   │ AM only  │ [Absent] │      │
│  └──────────────┴──────────┴──────────┴──────────┘      │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Date picker + Prev/Next day navigation
- All collectors listed with status toggle (Present/Absent/Half-Day)
- Quick actions per row to flip status
- "Mark All Present" bulk action
- Notes field per entry
- Saves automatically on toggle (or batch save button)

---

### 2. Payroll Report (`/reports/payroll`) — Admin Only

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Payroll Report                                           │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐  [CSV] [Print]   │
│  │ From Date      │  │ To Date        │                  │
│  └────────────────┘  └────────────────┘                  │
│                                                           │
│  Period: June 1-15, 2026              Total Days: 15       │
│                                                           │
│  ┌──────────┬────────┬──────┬──────┬──────┬────────┬──────┐│
│  │ Collector│ Salary │ Pres │ Abs  │ Half │ Deduct │ Net  ││
│  ├──────────┼────────┼──────┼──────┼──────┼────────┼──────┤│
│  │ Juan Cruz│₱7,500  │ 15   │ 0    │ 0    │ ₱0     │₱7,500││
│  │ Ped Snts │₱7,500  │ 13   │ 1    │ 2    │ ₱1,000 │₱6,500││
│  └──────────┴────────┴──────┴──────┴──────┴────────┴──────┘│
│                                                           │
│  TOTAL NET PAY: ₱14,000                                   │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Date range filter
- Per-collector breakdown table
- Summary row (total net pay)
- CSV export
- Print-friendly
- Links to collector's collection total for the period

---

### 3. Reports Hub Update (`/reports/page.tsx`)

Add new card:
```
┌──────────────────────────┐
│ ● Payroll Report         │
│   Collector salaries +   │
│   attendance deductions  │
└──────────────────────────┘
```

### 4. Navigation Update (`app-shell.tsx`)

Add Attendance link for admin:
```ts
{ href: "/attendance", label: "Attendance", icon: "ClipboardCheck" }
```

---

## Files Summary

| # | File | Action |
|---|------|--------|
| 1 | `prisma/schema.prisma` | Add Attendance model, monthlySalary to User |
| 2 | Migration | `npx prisma migrate dev --name add_attendance_payroll` |
| 3 | `src/app/api/attendance/route.ts` | NEW — GET list, POST single mark |
| 4 | `src/app/api/attendance/batch/route.ts` | NEW — POST batch mark |
| 5 | `src/app/api/reports/payroll/route.ts` | NEW — payroll computation |
| 6 | `src/app/attendance/page.tsx` | NEW — attendance management page |
| 7 | `src/app/reports/payroll/page.tsx` | NEW — payroll report page |
| 8 | `src/app/reports/page.tsx` | MODIFY — add payroll card |
| 9 | `src/components/app-shell.tsx` | MODIFY — add Attendance nav link |
| 10 | `src/types/api.ts` | MODIFY — add AttendanceDto, PayrollDto types |
| 11 | `src/lib/serializers.ts` | MODIFY — add serializeAttendance, serializePayroll |

**Total: ~350 lines across 11 files, 1 migration.**

---

## Considerations

### Open Questions
- [x] Working days: 7 days/week (including Sundays)
- [ ] Default monthlySalary: ₱500/day? Or per-collector configurable?
- [ ] Payroll period: Semi-monthly (1-15, 16-30) or monthly?
- [ ] Include Sunday/holiday pay differential?
- [ ] Show total collections per collector in payroll report?

### Future Enhancements
- Payroll approval flow (draft → approved → paid)
- Payroll history (archive past periods)
- Automatic EXPENSE entry when payroll is "paid"
- SSS/PhilHealth/Pag-IBIG deductions
- Cash advance tracking
- Collector performance: collections vs target
