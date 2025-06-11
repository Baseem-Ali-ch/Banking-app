"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import { formatDate } from "@/lib/utils"

interface TransferRequest {
  id: string
  accountId: string
  amount: number
  description: string
  transactionId: string | null
  userId: string
  status: string
  createdAt: string
  updatedAt: string
  account: {
    id: string
    accountHolderName: string
    accountNumber: string
    ifscCode: string
  }
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
}

interface TransferRequestsTableProps {
  requests: TransferRequest[]
  onViewDetails: (request: TransferRequest) => void
  loading: boolean
}

export function TransferRequestsTable({
  requests,
  onViewDetails,
  loading,
}: TransferRequestsTableProps) {
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
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return <div className="flex h-32 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

  if (!requests?.length) {
    return <div className="flex h-32 items-center justify-center text-muted-foreground">No transfer requests found</div>
  }

  return (
    <div className="space-y-4">
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
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                {request.id}
              </TableCell>
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
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(request)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
