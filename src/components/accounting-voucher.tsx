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
import { Skeleton } from "./ui/skeleton";

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

export function AccountingVoucher({
  data: {
    supplier,
    issueDate,
    dueDate: originalDueDate,
    vatRate,
    currency,
    totalAmount,
    invoiceOrReceiptNumber,
    rows,
  },
  isPending,
}: {
  data: PartialInvoiceVoucher;
  isPending: boolean;
}) {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currencyDisplay: "symbol",
    currency: currency ?? "USD",
  });
  const currencySymbol = currency
    ? getCurrencySymbol("en-US", currency)
    : "N/A";

  const dueDate = originalDueDate ?? issueDate;

  const skeletonLine = (
    <Skeleton className="h-[1rem] w-full justify-end rounded-lg" />
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start gap-4 justify-between">
          <div className="flex min-w-[33%] flex-col gap-2">
            <h3 className="flex items-center gap-2 text-lg font-medium">
              <span>Invoice </span>
              {isPending && !invoiceOrReceiptNumber ? (
                <Skeleton className="h-[1.2rem] w-full justify-end rounded-lg" />
              ) : (
                <span>#{invoiceOrReceiptNumber}</span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold whitespace-nowrap">
                Issued on:{" "}
              </span>
              {isPending && !issueDate
                ? skeletonLine
                : issueDate && (
                    <time dateTime={issueDate.toISOString()}>
                      {issueDate.toLocaleDateString()}
                    </time>
                  )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold whitespace-nowrap">Due by: </span>
              {isPending && !dueDate
                ? skeletonLine
                : dueDate && (
                    <time dateTime={dueDate.toISOString()}>
                      {dueDate.toLocaleDateString()}
                    </time>
                  )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold whitespace-nowrap">
                VAT Rate:{" "}
              </span>
              {isPending && !vatRate
                ? skeletonLine
                : vatRate && (
                    <span>
                      {isNumber(vatRate) ? `${vatRate * 100}%` : "N/A"}
                    </span>
                  )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold whitespace-nowrap">
                Total Amount:{" "}
              </span>
              {isPending && !totalAmount
                ? skeletonLine
                : totalAmount && (
                    <span>{currencyFormatter.format(totalAmount)}</span>
                  )}
            </div>
          </div>
          <div className="text-right min-w-[33%]">
            {isPending && !supplier ? (
              <Skeleton className="h-[1.2rem] w-full items-center justify-end rounded-lg" />
            ) : (
              <div className="text-lg font-medium text-gray-500 dark:text-gray-400">
                {supplier}
              </div>
            )}
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
            {isPending && (!rows || rows.length < 1) ? (
              <TableRow>
                <TableCell>
                  <Skeleton className="h-[2rem] w-full rounded-lg" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-[2rem] w-full rounded-lg" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-[2rem] w-full rounded-lg" />
                </TableCell>
              </TableRow>
            ) : (
              rows?.map((row, idx) => (
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
                        className="pl-10"
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
                        className="pl-10"
                        id="amount"
                        type="number"
                        readOnly
                        value={row.credit ?? "-"}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
