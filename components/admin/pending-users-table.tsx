"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, CheckCircle } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"

interface PendingUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string
  isPortalAccess: boolean
  createdAt: string
}

interface PendingUsersTableProps {
  users: PendingUser[]
  onViewDetails: (user: PendingUser) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading?: boolean
  selectedUsers: string[]
  onSelectAll: (checked: boolean) => void
  onToggleUser: (userId: string) => void
}

export function PendingUsersTable({
  users,
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  selectedUsers,
  onSelectAll,
  onToggleUser,
}: PendingUsersTableProps) {
  const getStatusBadge = (isPortalAccess: boolean) => {
    return (
      <Badge variant="outline" className={cn(
        "px-2 py-1",
        isPortalAccess ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
      )}>
        {isPortalAccess ? "Approved" : "Pending"}
      </Badge>
    )
  }

  const renderSkeleton = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-6 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
        </div>
      </TableCell>
    </TableRow>
  )

  if (users.length === 0 && !loading) {
    return <div className="flex h-32 items-center justify-center text-muted-foreground">No pending users found</div>
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]">
              <Checkbox
                checked={users.length > 0 && users.every(user => selectedUsers.includes(user.id))}
                indeterminate={
                  users.length > 0 &&
                  users.some(user => selectedUsers.includes(user.id)) &&
                  !users.every(user => selectedUsers.includes(user.id))
                }
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Portal Access</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {renderSkeleton()}
              </TableRow>
            ))
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className={cn(
                  "hover:bg-muted/50",
                  selectedUsers.includes(user.id) && "bg-muted/50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => onToggleUser(user.id)}
                  />
                </TableCell>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {getStatusBadge(user.isPortalAccess)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(user)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
