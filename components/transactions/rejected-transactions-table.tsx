"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, XCircle, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { TransactionDetailsModal } from "@/components/transactions/transaction-details-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMyRejectedTransaction, selectRejectedTransactions, selectRejectedTransactionsLoading, selectRejectedTransactionsPagination } from "@/store/slices/transactionsSlice"
import { AdminPagination } from "../admin/pagination"

enum TransactionStatus {
  REJECTED = "REJECTED",
}

enum TransactionType {
  TRANSFER = "TRANSFER",
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  PAYMENT = "PAYMENT",
  TRANSER_MONEY = "TRANSER_MONEY",
  ADD_MONEY = "ADD_MONEY",
}

export function RejectedTransactionsTable() {
  const dispatch = useAppDispatch()
  const transactions = useAppSelector(selectRejectedTransactions)
  const loading = useAppSelector(selectRejectedTransactionsLoading)
  const pagination = useAppSelector(selectRejectedTransactionsPagination)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchMyRejectedTransaction({ page: pagination.page, limit: pagination.limit }))
  }, [dispatch, pagination.page, pagination.limit])

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account?.accountHolderName?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pagination.limit)
  const paginatedTransactions = filteredTransactions.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </Badge>
        )
      case "PROCESSING":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Processing
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }


  const getTransactionIcon = (type: TransactionType) => {
    if (type === TransactionType.ADD_MONEY) {
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />
    } else {
      return <ArrowUpRight className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-600" />
              All Your Rejected Transactions
            </CardTitle>
            <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search transactions..."
                className="w-full pl-8 sm:w-[260px]"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rejected</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-16">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-16">
                    <div className="flex items-center justify-center text-muted-foreground">
                      No rejected transactions found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
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
                        className={`font-semibold ${transaction.transactionType === TransactionType.ADD_MONEY ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.transactionType === TransactionType.ADD_MONEY ? "+" : "-"}${transaction.amount}.00
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTransaction(transaction)
                          setIsModalOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <AdminPagination
            currentPage={pagination.page}
            totalPages={totalPages}
            onPageChange={(page) => {
              dispatch(fetchMyRejectedTransaction({ page, limit: pagination.limit }))
            }}
          />
        </CardContent>
      </Card>

      <TransactionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  )
}
