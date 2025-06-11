"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, Eye } from "lucide-react"
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

interface FundRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  currency: string
  paymentMethod: string
  status: string
  description: string
  createdAt: string
  requestedAt: string
  processedAt: string | null
  completedAt: string | null
  transactionId: string | null
  rejectionReason: string | null
}

interface FundRequestsTableProps {
  requests: FundRequest[]
  onViewDetails: (request: FundRequest) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function FundRequestsTable({
  requests,
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange,
}: FundRequestsTableProps) {
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

  if (requests.length === 0) {
    return <div className="flex h-32 items-center justify-center text-muted-foreground">No fund requests found</div>
  }

  return (
    <div className="overflow-x-auto ">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead> ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.id}</TableCell>
              <TableCell className="flex gap-1 mt-2">
                <span className="font-semibold text-green-600 ">
                  <ArrowDownLeft className="h-4 w-4" />
                </span>
                <span className="block max-w-[200px]">
                  {request.description}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-green-600 ">
                  + ₹{request.amount}.00
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>{formatDate(request.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onViewDetails(request)}>
                  <Eye className="mr-1 h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
