"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, ArrowDownLeft, PlusCircle, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TransactionDetailsModal } from "@/components/transactions/transaction-details-modal"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { fetchMyFundRequest } from "@/store/slices/transactionsSlice"
import { TransactionStatus } from "@/types"
import { AdminPagination } from "../admin/pagination"
import { FundRequestDetailsModal } from "./fund-request-details-modal"

enum TransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

enum TransactionType {
  DEPOSIT = "DEPOSIT",
}

export function FundRequestsTable() {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    fundRequests: requests,
    loading,
    error,
    currentPage,
    itemsPerPage,
    fundRequestsPagination
  } = useSelector((state: any) => state.transactions)

  useEffect(() => {
    dispatch(fetchMyFundRequest({ page: currentPage, limit: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handlePageChange = (page: number) => {
    dispatch(fetchMyFundRequest({ page, limit: itemsPerPage }))
  }

  const handleItemsPerPageChange = (items: number) => {
    dispatch(fetchMyFundRequest({ page: 1, limit: items }))
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PlusCircle className="h-6 w-6" />
              All Your Fund Requests
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
                  dispatch(fetchMyFundRequest({ page: 1, limit: itemsPerPage }))
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
                    <TableCell colSpan={7} className="h-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-12 text-center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  requests
                    .filter((transaction) => {
                      const matchesSearch =
                        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.id?.toLowerCase().includes(searchTerm.toLowerCase())
                      return matchesSearch
                    })
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell className="flex gap-1 mt-2">
                          <span className="font-semibold text-green-600 ">
                            <ArrowDownLeft className="h-4 w-4" />
                          </span>
                          <span className="block max-w-[200px]">
                            {transaction.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600 ">
                            + ₹{transaction.amount}.00
                          </span>
                        </TableCell>

                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(transaction)}>
                            <Eye className="h-4 w-4 mr-1" />

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
              currentPage={currentPage}
              totalPages={fundRequestsPagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={fundRequestsPagination.total}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </CardContent>
      </Card>
      <FundRequestDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  )
}
