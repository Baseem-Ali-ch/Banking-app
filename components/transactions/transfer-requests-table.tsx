"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, ArrowUpRight, Loader2, ArrowRightLeft } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchMyTransferRequests } from "@/store/slices/transactionsSlice"
import { useDispatch, useSelector } from "react-redux"
import { AdminPagination } from "../admin/pagination"
import { TransferDetailsModal } from "./transfer-details-modal"

enum TransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

enum TransactionType {
  TRANSFER = "TRANSFER",
}

export function TransferRequestsTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dispatch = useDispatch()

  const {
    transferRequests: requests,
    transferRequestsLoading,
    transferRequestsError,
    transferRequestsPagination,
    currentPage,
    itemsPerPage
  } = useSelector((state: any) => state.transactions)

  useEffect(() => {
    dispatch(fetchMyTransferRequests({ page: currentPage, limit: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  // Filter requests based on search term
  const filteredRequests = requests.filter((request: any) => {
    const matchesSearch =
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.account?.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handlePageChange = (page: number) => {
    dispatch(fetchMyTransferRequests({ page, limit: itemsPerPage }))
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              <span className="flex items-center gap-2">
                <ArrowRightLeft className="h-6 w-6" />
                All Your Transfer Requests
              </span>
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
                  dispatch(fetchMyTransferRequests({ page: 1, limit: itemsPerPage }))
                }}
              />
            </div>
          </div>
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
                {transferRequestsLoading ? (
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
                      No transfers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell className="flex gap-1 mt-2">
                        <span className="text-red-600">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        </span>
                        <span className="block max-w-[200px]">
                          {request.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600">
                          - ₹{request.amount}.00
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(request)}
                        >
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
              totalPages={transferRequestsPagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={transferRequestsPagination.total}
            />
          </div>
        </CardContent>
      </Card>
      <TransferDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  )
}
