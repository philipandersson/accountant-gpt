import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PartialInvoiceVoucher } from "@/lib/schemas";
import { isNumber } from "lodash";
import { Input } from "./ui/input";

function getCurrencySymbol(locale: string, currency: string) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const parts = formatter.formatToParts(0);
  const currencySymbol = parts.find((part) => part.type === "currency")?.value;

  return currencySymbol ?? "N/A";
}

export default function AccountingVoucher({
  supplier,
  issueDate,
  dueDate: originalDueDate,
  vatRate,
  currency,
  totalAmount,
  invoiceOrReceiptNumber,
  rows,
}: PartialInvoiceVoucher) {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currencyDisplay: "symbol",
    currency: currency ?? "USD",
  });
  const currencySymbol = currency
    ? getCurrencySymbol("en-US", currency)
    : "N/A";

  const dueDate = originalDueDate ?? issueDate;

  return (
    <Card className="w-full md:w-1/2">
      <CardHeader>
        <div className="flex items-start gap-4 justify-between">
          <div>
            <h3 className="text-lg font-medium">
              Invoice #{invoiceOrReceiptNumber}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Issued on: </span>
              {issueDate && (
                <time dateTime={issueDate.toISOString()}>
                  {issueDate.toLocaleDateString()}
                </time>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Due by: </span>
              {dueDate && (
                <time dateTime={dueDate.toISOString()}>
                  {dueDate.toLocaleDateString()}
                </time>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">VAT Rate: </span>
              <span>{isNumber(vatRate) ? `${vatRate * 100}%` : "N/A"}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Total Amount: </span>
              {totalAmount && (
                <span>{currencyFormatter.format(totalAmount)}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium text-gray-500 dark:text-gray-400">
              {supplier}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows?.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  {row.accountName} - {row.account}
                </TableCell>
                <TableCell className="text-right">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">
                        {currencySymbol}
                      </span>
                    </div>
                    <Input
                      className="pl-9"
                      id="amount"
                      type="number"
                      readOnly
                      value={row.debit ?? "-"}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">
                        {currencySymbol}
                      </span>
                    </div>
                    <Input
                      className="pl-9"
                      id="amount"
                      type="number"
                      readOnly
                      value={row.credit ?? "-"}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
