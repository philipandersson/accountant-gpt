import { z } from "zod";

export const base64ImageSchema = z.object({
  name: z.string(),
  base64: z.string().base64(),
  type: z.string(),
});

export const bodySchema = z.object({
  images: z.array(base64ImageSchema),
});

export type Base64Image = z.infer<typeof base64ImageSchema>;

export const invoiceVoucherSchema = z.object({
  supplier: z.string(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().nullable(),
  vatRate: z.number().min(0).max(1),
  totalAmount: z.number(),
  currency: z.string().describe("ISO 4217 currency code"),
  invoiceOrReceiptNumber: z.string().nullable(),
  rows: z.array(
    z.object({
      account: z
        .number()
        .int()
        .min(1)
        .max(8999)
        .describe("Account number from structure/plan/layout"),
      accountName: z.string().describe("Account name"),
      debit: z.number().min(0).describe("Debit amount"),
      credit: z.number().min(0).describe("Credit amount"),
    })
  ),
});

export type InvoiceVoucher = z.infer<typeof invoiceVoucherSchema>;
