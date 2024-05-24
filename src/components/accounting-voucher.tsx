import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceVoucher } from "@/lib/schemas";

export default function AccountingVoucher({
  supplier,
  issueDate,
  dueDate,
  vatRate,
  currency,
  totalAmount,
  invoiceOrReceiptNumber,
  rows,
}: InvoiceVoucher) {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currencyDisplay: "symbol",
    currency,
  });

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
              <time dateTime={issueDate.toISOString()}>
                {issueDate.toLocaleDateString()}
              </time>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Due by: </span>
              <time dateTime={(dueDate ?? issueDate).toISOString()}>
                {(dueDate ?? issueDate).toLocaleDateString()}
              </time>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">VAT Rate: </span>
              <span>{vatRate * 100}%</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Total Amount: </span>
              <span>{currencyFormatter.format(totalAmount)}</span>
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
            {rows.map((row) => (
              <TableRow key={row.account}>
                <TableCell>
                  {row.accountName} - {row.account}
                </TableCell>
                <TableCell className="text-right">
                  {row.debit ? currencyFormatter.format(row.debit) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {row.credit ? currencyFormatter.format(row.credit) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
