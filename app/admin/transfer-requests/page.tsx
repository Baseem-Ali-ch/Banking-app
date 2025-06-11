"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, ArrowUpDown } from "lucide-react"
import { TransferRequestsTable } from "@/components/admin/transfer-requests-table"
import { TransferRequestDetailsModal } from "@/components/admin/transfer-request-details-modal"
import { fetchTransferRequests, updateTransferRequestStatus } from "@/store/slices/transactionsSlice"
import { AppDispatch } from "@/store/store"
import { useAppSelector } from "@/store/hooks"
import { AdminPagination } from "@/components/admin/pagination"
import { toast } from "sonner"

interface TransferRequest {
  id: string
  user: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
  }
  amount: number
  currency: string
  status: string
  description: string
  createdAt: string
  updatedAt: string
  transactionId: string | null
}

export default function TransferRequestsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    transferRequests: requests,
    transferRequestsLoading: loading,
    transferRequestsError: error,
    currentPage,
    itemsPerPage,
    transferRequestsPagination
  } = useAppSelector((state) => state.transactions)
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchTransferRequests({ page: currentPage, limit: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  const handleViewDetails = (request: TransferRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const handlePageChange = (page: number) => {
    console.log('Page change:', page)
    dispatch(fetchTransferRequests({ page, limit: itemsPerPage }))
  }

  const handleRefresh = () => {
    dispatch(fetchTransferRequests({ page: currentPage, limit: itemsPerPage }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Transfer Requests</h2>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              <Search className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{requests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{requests?.filter((r) => r.status === "PENDING").length || 0}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{requests?.filter((r) => r.status === "PROCESSING").length || 0}</div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{requests?.filter((r) => r.status === "COMPLETED").length || 0}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{requests?.filter((r) => r.status === "REJECTED").length || 0}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <ArrowUpDown className="h-6 w-6" />
              All Transfer Requests
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransferRequestsTable
            requests={requests || []}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
          {transferRequestsPagination?.totalPages > 1 && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={transferRequestsPagination.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={transferRequestsPagination.total}
            />
          )}
        </CardContent>
      </Card>

      <TransferRequestDetailsModal
        request={selectedRequest}
        open={isModalOpen}
        onClose={() => {
          setSelectedRequest(null)
          setIsModalOpen(false)
        }}
        onUpdateStatus={async (requestId, newStatus, data) => {
          try {
            await dispatch(updateTransferRequestStatus({ id: requestId, status: newStatus, data }))
            // Refresh the list after status update
            await dispatch(fetchTransferRequests({ page: currentPage, limit: itemsPerPage }))
          } catch (error: any) {
            toast.error("Error", {
              description: error.message || "Failed to update transfer request status",
              duration: 1500,
              position: 'top-right'
            })
          }
        }}
      />
    </div>
  )
}
