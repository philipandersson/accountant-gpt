import { InvoiceVoucher } from "../schemas";

export async function* createFakeInvoiceVoucherGenerator(): AsyncGenerator<
  Partial<InvoiceVoucher>
> {
  async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const invoiceVoucher = {
    supplier: "BMW",
    issueDate: new Date(),
    dueDate: new Date(),
    vatRate: 0,
    totalAmount: 14.5,
    currency: "USD",
    invoiceOrReceiptNumber: "ABC",
    rows: [
      {
        account: 2440,
        accountName: "Leverantörsskulder",
        credit: 14.5,
        debit: 0,
      },
      { account: 6540, accountName: "IT-tjänster", credit: 0, debit: 14.5 },
    ],
  } as const;

  const entries = Object.entries(invoiceVoucher);
  let obj: Partial<InvoiceVoucher> = {};

  for (const [key, value] of entries) {
    obj = { ...obj, [key]: value };
    yield obj;
    await sleep(Math.random() * 450 + 50);
  }
}
