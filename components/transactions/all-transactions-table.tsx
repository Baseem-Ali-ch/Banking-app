"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Eye, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminPagination } from "@/components/admin/pagination"
import { fetchMyCompletedTransactions } from "@/store/slices/transactionsSlice"
import { selectCompletedTransactions, selectCompletedTransactionsLoading, selectCompletedTransactionsPagination } from "@/store/slices/transactionsSlice"
import { TransactionDetailsModal } from "./transaction-details-modal"

// Define transaction types and statuses locally
enum TransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

enum TransactionType {
  TRANSFER = "TRANSFER",
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  PAYMENT = "PAYMENT",
}

export function AllTransactionsTable() {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const completedTransactions = useSelector(selectCompletedTransactions)
  const loading = useSelector(selectCompletedTransactionsLoading)
  const pagination = useSelector(selectCompletedTransactionsPagination)

  useEffect(() => {
    dispatch(fetchMyCompletedTransactions({ page: pagination.page, limit: pagination.limit }))
  }, [dispatch, pagination.page, pagination.limit])

  // Filter transactions based on search term
  const filteredTransactions = completedTransactions.filter((transaction: any) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const handlePageChange = (page: number) => {
    dispatch(fetchMyCompletedTransactions({ page, limit: pagination.limit }))
  }

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getTransactionIcon = (transactionType: string) => {
    if (transactionType === "ADD_MONEY") {
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />
    } else {
      return <ArrowUpRight className="h-4 w-4 text-red-600" />
    }
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              All Your Transactions
            </span>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="w-full pl-8 sm:w-[260px]"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  dispatch(fetchMyCompletedTransactions({ page: 1, limit: pagination.limit }))
                }}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-16">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-12 text-center">
                      No completed transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>

                      <TableCell><div className="flex items-center max-w-[200px]">
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
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-center">
            <AdminPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={pagination.limit}
              totalItems={pagination.total}
            />
          </div>
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
