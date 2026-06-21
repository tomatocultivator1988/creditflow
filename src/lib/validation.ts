import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required field");
const moneyString = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")
  .refine((v) => v.replace(".", "").length <= 14, "Amount exceeds maximum precision (14 digits total)");
const dateOnlyString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format");
const phoneString = z
  .string()
  .trim()
  .regex(/^\d{7,15}$/, "Phone must contain 7 to 15 digits only");
const nameString = z
  .string()
  .trim()
  .min(2, "Name is too short")
  .max(120, "Name is too long")
  .regex(/^[\p{L}][\p{L}\s.'-]*$/u, "Name contains unsupported characters");

export const fbLinkSchema = z
  .string()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal(""));

export const createLoanSchema = z.object({
  customerName: nameString,
  customerPhone: phoneString,
  customerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  customerAddress: requiredString,
  fbLink: fbLinkSchema,
  idNumber: z.string().optional(),
  validIdType: z.string().optional(),
  principal: moneyString,
  interestRate: moneyString,
  processingFee: moneyString.optional(),
  termDays: z.coerce
    .number()
    .int()
    .min(1, "Term must be at least 1 day")
    .max(365, "Term cannot exceed 365 days"),
  startDate: dateOnlyString,
  remarks: z.string().optional(),
});

export const updateLoanSchema = z.object({
  customerName: nameString,
  customerPhone: phoneString,
  customerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  customerAddress: requiredString,
  fbLink: fbLinkSchema,
  idNumber: z.string().optional(),
  validIdType: z.string().optional(),
  remarks: z.string().optional(),
});

export const createExpenseSchema = z.object({
  type: z.enum(["SALARY", "OTHER"]),
  amount: moneyString,
  description: z.string().optional(),
  date: dateOnlyString,
  customFields: z.record(z.string(), z.any()).optional(),
});

export const addCapitalSchema = z.object({
  amount: moneyString,
  description: z.string().optional(),
});

export const withdrawCapitalSchema = z.object({
  amount: moneyString,
  description: z.string().optional(),
});

export const createPaymentSchema = z.object({
  loanAccountId: requiredString,
  amount: moneyString,
  paymentDate: dateOnlyString,
  notes: z.string().optional(),
});

export const updateAdminConfigSchema = z.object({
  defaultInterestRate: moneyString,
  termOptions: z
    .array(z.number().int().min(1).max(365))
    .min(1, "At least one term option required")
    .refine((arr) => new Set(arr).size === arr.length, "Term options must be unique"),
});

export const createUserSchema = z.object({
  name: nameString,
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "COLLECTOR"]),
});
