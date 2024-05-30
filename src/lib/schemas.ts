import { z } from "zod";

export const base64ImageSchema = z.object({
  name: z.string(),
  base64: z.string().base64(),
  type: z.string(),
});

export const bodySchema = z.object({
  prompt: z.string().nullable(),
  images: z.array(base64ImageSchema),
});

export type LlmQuery = z.infer<typeof bodySchema>;

export type Base64Image = z.infer<typeof base64ImageSchema>;

const voucherRowSchema = z.object({
  account: z
    .number()
    .int()
    .min(1)
    .max(8999)
    .describe("Account number from structure/plan/layout"),
  accountName: z.string().describe("Account name"),
  debit: z.number().min(0).describe("Debit amount"),
  credit: z.number().min(0).describe("Credit amount"),
});

export const invoiceVoucherSchema = z.object({
  supplier: z.string(),
  issueDate: z.coerce
    .date()
    .describe("Date of issuance for invoice or receipt"),
  dueDate: z.coerce
    .date()
    .nullable()
    .describe("Due date of invoice or receipt if defined"),
  vatRate: z.number().min(0).max(1),
  totalAmount: z.number(),
  currency: z.string().describe("Extract ISO 4217 currency code from image"),
  invoiceOrReceiptNumber: z
    .string()
    .nullable()
    .describe("Extract invoice or receipt number from image if it exists"),
  rows: z.array(voucherRowSchema).min(2),
});

export type InvoiceVoucher = z.infer<typeof invoiceVoucherSchema>;

export const partialInvoiceVoucherSchema = invoiceVoucherSchema
  .extend({
    supplier: invoiceVoucherSchema.shape.supplier.nullish(),
    issueDate: invoiceVoucherSchema.shape.issueDate.nullish(),
    dueDate: invoiceVoucherSchema.shape.dueDate.nullish(),
    vatRate: invoiceVoucherSchema.shape.vatRate.nullish(),
    totalAmount: invoiceVoucherSchema.shape.totalAmount.nullish(),
    currency: invoiceVoucherSchema.shape.currency.nullish(),
    invoiceOrReceiptNumber:
      invoiceVoucherSchema.shape.invoiceOrReceiptNumber.nullish(),
    rows: z.array(voucherRowSchema.partial()),
  })
  .partial();

export type PartialInvoiceVoucher = z.infer<typeof partialInvoiceVoucherSchema>;
