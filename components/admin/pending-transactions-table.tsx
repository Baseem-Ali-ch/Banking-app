"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import { formatDate } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { TransactionType } from "@/types"

interface PendingTransaction {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  currency: string
  transactionType: string
  type: string
  description: string
  status: string
  createdAt: string
}

interface PendingTransactionsTableProps {
  transactions: PendingTransaction[]
  onViewDetails: (transaction: PendingTransaction) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PendingTransactionsTable({
  transactions,
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange,
}: PendingTransactionsTableProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "TRANSFER":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Transfer
          </Badge>
        )
      case "DEPOSIT":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Deposit
          </Badge>
        )
      case "WITHDRAWAL":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Withdrawal
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getTransactionIcon = (type: TransactionType) => {
    if (type === TransactionType.ADD_MONEY) {
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />
    } else {
      return <ArrowUpRight className="h-4 w-4 text-red-600" />
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">No pending transactions found</div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-[200px]">
                    {getTransactionIcon(transaction.transactionType as TransactionType)}
                    <div>
                      <div>{transaction.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-semibold ${transaction.transactionType === "ADD_MONEY" ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {transaction.transactionType === "ADD_MONEY" ? "+" : "-"}${transaction.amount}
                  </span>
                </TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(transaction)}>
                    <Eye className="mr-1 h-4 w-4" />

                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
