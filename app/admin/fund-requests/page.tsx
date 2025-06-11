"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, CreditCard } from "lucide-react"
import { FundRequestsTable } from "@/components/admin/fund-requests-table"
import { FundRequestDetailsModal } from "@/components/admin/fund-request-details-modal"
import { fetchFundRequestTransaction } from "@/store/slices/transactionsSlice"
import { AppDispatch } from "@/store/store"
import { AdminPagination } from "@/components/admin/pagination"

export default function FundRequestsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    fundRequests: requests,
    loading,
    error,
    currentPage,
    itemsPerPage,
    fundRequestsPagination
  } = useSelector((state: any) => state.transactions)
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchFundRequestTransaction({ page: currentPage, limit: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  useEffect(() => {
    if (!requests) return;

    let filtered = [...requests]

    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedRequests = filtered.slice(startIndex, startIndex + itemsPerPage)
  }, [requests, searchTerm, statusFilter, currentPage, itemsPerPage])

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const handlePageChange = (page: number) => {
    dispatch(fetchFundRequestTransaction({ page, limit: itemsPerPage }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fund Requests</h1>
          <p className="text-muted-foreground">Manage wallet funding requests from users</p>
        </div>
        <Button variant="outline" onClick={() => dispatch(fetchFundRequestTransaction({ page: currentPage, limit: itemsPerPage }))}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{requests?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{requests?.filter((r) => r.status === "PENDING")?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{requests?.filter((r) => r.status === "PROCESSING")?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{requests?.filter((r) => r.status === "COMPLETED")?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{requests?.filter((r) => r.status === "REJECTED")?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fund Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              All Fund Requests
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FundRequestsTable
            requests={requests}
            loading={loading}
            onViewDetails={handleViewDetails}
          />
          <AdminPagination
            currentPage={currentPage}
            totalPages={fundRequestsPagination.totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={fundRequestsPagination.total}
          />
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedRequest && (
        <FundRequestDetailsModal
          request={selectedRequest}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={(requestId, newStatus, data) => {
            // Handle status update
          }}
        />
      )}
    </div>
  )
}
