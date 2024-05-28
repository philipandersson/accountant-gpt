import { predictInvoiceVoucher } from "@/lib/invoice-voucher/predict";
import { PartialInvoiceVoucher } from "@/lib/schemas";
import { describe, expect, it } from "bun:test";
import { omit } from "lodash";
import path from "path";

const evals = [
  {
    prompt: "Det här är en faktura för cloudtjänster",
    filename: "invoice-1.png",
    gold: {
      supplier: "Akamai Technologies International AG",
      issueDate: new Date("2024-05-01T04:08:45"),
      dueDate: null,
      vatRate: 0,
      totalAmount: 14.5,
      currency: "USD",
      invoiceOrReceiptNumber: "26360606",
      rows: [
        { accountName: "IT-tjänster", account: 6540, debit: 14.5, credit: 0 },
        {
          accountName: "Leverantörsskulder",
          account: 2440,
          debit: 0,
          credit: 14.5,
        },
      ],
    },
  },
  {
    prompt: "Det här är ett kvitto för ett coworking-kontor",
    filename: "invoice-2.png",
    gold: {
      supplier: "Bröd & Salt Bageri AB",
      issueDate: new Date("2024-05-21T01:00:21"),
      dueDate: null,
      vatRate: 0.25,
      totalAmount: 999,
      currency: "SEK",
      invoiceOrReceiptNumber: null,
      rows: [
        {
          accountName: "Hyra för kontorslokaler",
          account: 5011,
          debit: 799.2,
          credit: 0,
        },
        {
          accountName: "Debiterad ingående moms",
          account: 2641,
          debit: 199.8,
          credit: 0,
        },
        {
          accountName: "Företagskonto/checkkonto/affärskonto",
          account: 1930,
          debit: 0,
          credit: 999,
        },
      ],
    },
  },
];

describe("invoice-voucher-predictions", async () => {
  for (const { prompt, filename, gold } of evals) {
    it(`should match gold for ${filename}`, async () => {
      const file = Bun.file(path.join(__dirname, "data", filename));
      const imageBase64 = Buffer.from(await file.arrayBuffer()).toString(
        "base64"
      );

      let prediction: PartialInvoiceVoucher = {};

      for await (const chunk of await predictInvoiceVoucher(
        [
          {
            name: filename,
            base64: imageBase64,
            type: `data:${file.type};base64`,
          },
        ],
        prompt
      )) {
        prediction = chunk;
      }

      prediction = omit(prediction, "_meta");
      prediction.issueDate = prediction?.issueDate
        ? new Date(prediction.issueDate)
        : null;
      prediction.dueDate = prediction?.dueDate
        ? new Date(prediction.dueDate)
        : null;

      expect(prediction).toEqual(gold);
    });
  }
});
