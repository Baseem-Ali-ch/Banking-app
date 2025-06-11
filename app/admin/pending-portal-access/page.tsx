'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw } from "lucide-react"
import { PendingUsersTable } from "@/components/admin/pending-users-table"
import { UserDetailsModal } from "@/components/admin/user-details-modal"
import { toast } from "sonner"
import { adminApi } from "@/api/admin"
import { User } from "@/types"
import { fetchPendingPortalAccessUsers, updateUserStatus, setCurrentPage, updatePortalAccess, bulkApprovePortalAccess } from "@/store/slices/userManagementSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { CheckCircle } from "lucide-react"
import { X } from "lucide-react"

export default function PendingPortalAccessPage() {
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const dispatch = useAppDispatch()
  const { users } = useAppSelector((state) => state.userManagement)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      await dispatch(fetchPendingPortalAccessUsers())
    } catch (error: any) {
      toast.error("Failed", {
        description: error.message || "Failed to fetch pending users",
        duration: 1500,
        position: 'top-right'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailPanelOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailPanelOpen(false)
    setSelectedUser(null)
  }

  const handleApproveAccess = async (userId: string) => {
    try {
      setLoading(true)
      const result = await dispatch(updatePortalAccess({ userId, isPortalAccess: true }))

      if (result.meta.requestStatus === 'fulfilled' && result.payload?.status === "success") {

        toast.success("Updated Successfully", {
          description: result.payload.message || "Portal access approved successfully",
          duration: 1500,
          position: 'top-right'
        })
        setIsDetailPanelOpen(false)
        // Refresh the list after approval
        await fetchPendingUsers()
      } else {
        toast.error("Failed to approve portal access", {
          description: result.payload?.message || "Please try again",
          duration: 1500,
          position: 'top-right'
        })
      }
    } catch (error: any) {
      toast.error("Failed to approve access", {
        description: error.message,
        duration: 1500,
        position: 'top-right'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.items.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleClearSelections = () => {
    setSelectedUsers([])
  }

  const handleBulkApprove = async () => {
    try {
      setLoading(true)
      const result = await dispatch(bulkApprovePortalAccess({ userIds: selectedUsers, isPortalAccess: true }))

      if (result.meta.requestStatus === 'fulfilled' && result.payload?.status === "success") {
        toast.success(`Bulk approval completed`, {
          description: result.payload.message ||
            `Successfully updated ${result.payload.data.totalUpdated} out of ${result.payload.data.totalRequested} users`,
          duration: 1500,
          position: 'top-right'
        })

        // Clear selections and refresh list
        handleClearSelections()
        await fetchPendingUsers()
      } else {
        toast.error("Failed to approve portal access", {
          description: result.payload?.message || "Please try again",
          duration: 1500,
          position: 'top-right'
        })
      }
    } catch (error: any) {
      toast.error("Failed to approve access", {
        description: error.message,
        duration: 1500,
        position: 'top-right'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pending Portal Access</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            onClick={handleBulkApprove}
            disabled={selectedUsers.length === 0}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Selected ({selectedUsers.length})
          </Button>
          <Button
            variant="outline"
            onClick={handleClearSelections}
            disabled={selectedUsers.length === 0}
          >
            <X className="mr-2 h-4 w-4" />
            Clear Selection
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <PendingUsersTable
            users={users.items}
            onViewDetails={handleViewDetails}
            currentPage={users.page}
            totalPages={users.pages}
            onPageChange={(page) => dispatch(setCurrentPage(page))}
            loading={loading}
            selectedUsers={selectedUsers}
            onSelectAll={handleSelectAll}
            onToggleUser={handleToggleUser}
          />
        </CardContent>
      </Card>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          open={isDetailPanelOpen}
          onClose={handleCloseDetails}
          onApprove={() => handleApproveAccess(selectedUser.id)}
        />
      )}
    </div>
  )
}
