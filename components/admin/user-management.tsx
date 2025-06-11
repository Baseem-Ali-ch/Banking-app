"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  PenSquare,
  RefreshCcw,
  Search,
  UserPlus,
  X,
  Mail,
  AlertTriangle,
  ArrowUpDown,
  Loader2,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { UserStatus, type User } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchUserBankAccounts,
  fetchUserActivityLog,
  setSearchTerm,
  setStatusFilter,
  setActivityFilter,
  setDateRange,
  resetFilters,
  selectUser,
  selectAllUsers,
  clearSelection,
  setSelectedUser,
  setDetailPanelOpen,
  setBulkActionDialogOpen,
  setBulkAction,
  setSortConfig,
  bulkUpdateUserStatus,
  exportUsers,
  fetchUsers,
  fetchUserDetails,
} from "@/store/slices/userManagementSlice"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { subDays } from "date-fns"
import { toast } from 'sonner'
import { RootState } from "@/store/store"
import { AdminPagination } from "./pagination"

// Status badge component
const StatusBadge = ({ status }: { status: UserStatus }) => {
  switch (status) {
    case UserStatus.ACTIVE:
      return <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">Active</Badge>
    case UserStatus.INACTIVE:
    case UserStatus.SUSPENDED:
      return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">{status === UserStatus.INACTIVE ? 'Inactive' : 'Suspended'}</Badge>
    default:
      return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">Unknown</Badge>
  }
}

export function UserManagement() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Local state
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUserState] = useState<User | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpenState] = useState(false)
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpenState] = useState(false)
  const [bulkAction, setBulkActionState] = useState("")
  const [sortConfig, setSortConfigState] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [searchTerm, setSearchTermState] = useState("")
  const [statusFilter, setStatusFilterState] = useState("all")
  const [activityFilter, setActivityFilterState] = useState("all")
  const [dateRange, setDateRangeState] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const userManagementState = useAppSelector((state) => state.userManagement)

  // Fetch users on component mount
  const fetchData = async (page: number = currentPage) => {
    try {
      setLoading(true)
      const result = await dispatch(fetchUsers({ page, limit: itemsPerPage })).unwrap()
      if (result) {
        setUsers(result.users)
        setFilteredUsers(result.users)
        setTotalPages(result.pagination.totalPages)
        setTotalItems(result.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dispatch])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchData(page)
  }

  // Apply filters
  useEffect(() => {
    let result = [...users]

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((user) => {
        const userStatus = user.isPortalAccess ? UserStatus.ACTIVE : UserStatus.INACTIVE
        return userStatus === statusFilter
      })
    }

    if (dateRange?.from && dateRange?.to) {
      result = result.filter((user) => {
        const createdDate = new Date(user.createdAt)
        return createdDate >= dateRange.from! && createdDate <= dateRange.to!
      })
    }

    if (sortConfig) {
      result.sort((a, b) => {
        if (sortConfig.key === "status") {
          const aStatus = a.isPortalAccess ? UserStatus.ACTIVE : UserStatus.INACTIVE
          const bStatus = b.isPortalAccess ? UserStatus.ACTIVE : UserStatus.INACTIVE
          if (aStatus < bStatus) return sortConfig.direction === "ascending" ? -1 : 1
          if (aStatus > bStatus) return sortConfig.direction === "ascending" ? 1 : -1
        }
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1
        return 0
      })
    }

    setFilteredUsers(result)
  }, [users, searchTerm, statusFilter, activityFilter, dateRange, sortConfig])

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfigState({ key, direction })
    if (userManagementState) dispatch(setSortConfig({ key, direction }))
  }

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
    if (userManagementState) dispatch(selectUser(userId))
  }

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
    if (userManagementState) dispatch(selectAllUsers())
  }

  const handleViewUserDetails = async (user: User) => {
    try {
      const result = await dispatch(fetchUserDetails(user.id))
      if (result.meta.requestStatus === 'fulfilled') {
        const userDetails = result.payload
        if (userDetails && userDetails.data && userDetails.data.user) {
          setSelectedUserState(userDetails.data.user)
          setIsDetailPanelOpenState(true)
          if (userManagementState) {
            dispatch(setSelectedUser(userDetails.data.user))
            dispatch(setDetailPanelOpen(true))
          }
        }
      } else {
        throw new Error(result.error.message || 'Failed to load user details')
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error)
      toast.error('Failed', {
        description: error.message || 'Failed to load user details',
        duration: 1500,
        position: 'top-right'
      })
    }
  }

  const handleEditUser = (user: User) => {
    router.push(`/admin/users/${user.id}/edit`)
  }

  const handleToggleUserStatus = async (user: User) => {
    const updatedUsers = users.map((u) =>
      u.id === user.id
        ? { ...u, isPortalAccess: u.isPortalAccess === true ? false : true }
        : u,
    )
    setUsers(updatedUsers)
    if (userManagementState) {
      const result = await dispatch(
        toggleUserPortalAccess({
          userId: user.id,
          isPortalAccess: user.isPortalAccess === true ? false : true,
        }),
      ).unwrap()

      if (result.status === "success") {
        toast.success("User Status Updated", {
          description: result.message || 'User status updated successfully',
          duration: 1500,
          position: 'top-right'
        })
      } else {
        toast.error("User Status Update Failed", {
          description: result.message || 'User status update failed',
          duration: 1500,
          position: 'top-right'
        })
      }
    }
  }

  const handleViewUserTransactions = (user: User) => {
    router.push(`/admin/transactions?userId=${user.id}`)
  }

  const handleBulkAction = () => {
    if (bulkAction === "export") {
      const usersToExport = [...selectedUsers];
      console.log("Exporting users:", usersToExport);
      setIsBulkActionDialogOpenState(false);
      setSelectedUsers([]);
      if (userManagementState) {
        dispatch(
          exportUsers({
            userIds: usersToExport,
            options: {
              includePersonal: true,
              includeAccounts: true,
              includeTransactions: true,
              includeActivity: true,
            },
          }),
        );
        dispatch(setBulkActionDialogOpen(false));
        dispatch(clearSelection());
      }
    } else if (bulkAction === "activate" || bulkAction === "suspend") {
      const usersToUpdateIds = [...selectedUsers];
      const updatedUsersLocally = users.map((user) =>
        usersToUpdateIds.includes(user.id)
          ? { ...user, status: bulkAction === "activate" ? UserStatus.ACTIVE : UserStatus.SUSPENDED }
          : user,
      );
      setUsers(updatedUsersLocally);
      setIsBulkActionDialogOpenState(false);
      setSelectedUsers([]);
      if (userManagementState) {
        dispatch(
          bulkUpdateUserStatus({
            userIds: usersToUpdateIds,
            status: bulkAction === "activate" ? UserStatus.ACTIVE : UserStatus.SUSPENDED,
          }),
        );
        dispatch(setBulkActionDialogOpen(false));
        dispatch(clearSelection());
      }
    } else if (bulkAction === "grantPortalAccess" || bulkAction === "revokePortalAccess") {
      const usersToUpdateIds = [...selectedUsers];
      const grantAccess = bulkAction === "grantPortalAccess";

      // Optimistic UI update
      const updatedUsersLocally = users.map((user) =>
        usersToUpdateIds.includes(user.id)
          ? { ...user, isPortalAccess: grantAccess }
          : user,
      );
      setUsers(updatedUsersLocally);
      setIsBulkActionDialogOpenState(false);
      setSelectedUsers([]);

      if (userManagementState) {
        dispatch(
          bulkToggleUserPortalAccess({
            userIds: usersToUpdateIds,
            isPortalAccess: grantAccess,
          }),
        ).then((action) => {
          // After the thunk is fulfilled, show an alert based on the response
          if (bulkToggleUserPortalAccess.fulfilled.match(action)) {
            const response = action.payload as BulkPortalAccessResponse;
            if (response.status === 'success') {

              toast.success("Bulk Update Successful", {
                description: response.message,
                duration: 1500,
                position: 'top-right'
              })
            } else {
              toast.error("Bulk Update Failed", {
                description: response.message,
                duration: 1500,
                position: 'top-right'
              })
            }

          } else if (bulkToggleUserPortalAccess.rejected.match(action)) {
            toast.error("Bulk Update Failed", {
              description: action.error.message || 'An unexpected error occurred.',
              duration: 1500,
              position: 'top-right'
            })
          }
        });
      }
    }
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Responsive header layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage all registered users in the system.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUsers([])
              if (userManagementState) dispatch(clearSelection())
            }}
            disabled={selectedUsers.length === 0}
            className="min-w-[120px]"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Selection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkActionState("export")
              setIsBulkActionDialogOpenState(true)
              if (userManagementState) {
                dispatch(setBulkAction("export"))
                dispatch(setBulkActionDialogOpen(true))
              }
            }}
            disabled={selectedUsers.length === 0}
            className="min-w-[120px]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={selectedUsers.length === 0} className="min-w-[120px]">
                Bulk Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions for {selectedUsers.length} users</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setBulkActionState("grantPortalAccess")
                  setIsBulkActionDialogOpenState(true)
                  if (userManagementState) {
                    dispatch(setBulkAction("grantPortalAccess"))
                    dispatch(setBulkActionDialogOpen(true))
                  }
                }}
              >
                Grant Portal Access
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setBulkActionState("revokePortalAccess")
                  setIsBulkActionDialogOpenState(true)
                  if (userManagementState) {
                    dispatch(setBulkAction("revokePortalAccess"))
                    dispatch(setBulkActionDialogOpen(true))
                  }
                }}
                className="text-red-600"
              >
                Revoke Portal Access
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="all-users" className="w-full">
        {/* Responsive TabsList with horizontal scroll on mobile */}
        <TabsList className="mb-4 w-full overflow-x-auto sm:grid sm:grid-cols-3">
          <TabsTrigger value="all-users" className="text-xs sm:text-sm">All Users</TabsTrigger>
          <TabsTrigger value="active-users" className="text-xs sm:text-sm">Active Users</TabsTrigger>
          <TabsTrigger value="pending-verification" className="text-xs sm:text-sm">Pending Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">User Filters</CardTitle>
              <CardDescription className="text-sm">
                Filter users by various criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Responsive filter grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      type="search"
                      placeholder="Name, Email, or ID..."
                      className="pl-8 text-sm"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTermState(e.target.value)
                        if (userManagementState) dispatch(setSearchTerm(e.target.value))
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilterState(value)
                      if (userManagementState) dispatch(setStatusFilter(value))
                    }}
                  >
                    <SelectTrigger id="status" className="text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Registration Date</Label>
                  <DatePickerWithRange
                    date={dateRange}
                    setDate={(range) => {
                      setDateRangeState(range)
                      if (userManagementState) dispatch(setDateRange(range))
                    }}
                  />
                </div>
                <div className="space-y-2 sm:mt-8 lg:mt-0 flex justify-center lg:justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTermState("")
                      setStatusFilterState("all")
                      setActivityFilterState("all")
                      setDateRangeState({
                        from: subDays(new Date(), 30),
                        to: new Date(),
                      })
                      if (userManagementState) dispatch(resetFilters())
                    }}
                    className="min-w-[120px]"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Users</CardTitle>

                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile-friendly table with card layout for small screens */}
              <div className="hidden sm:block rounded-md border">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                            onCheckedChange={handleSelectAllUsers}
                            aria-label="Select all users"
                          />
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort("lastName")}>
                          <div className="flex items-center space-x-1">
                            <span>Full Name</span>
                            {sortConfig?.key === "lastName" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort("email")}>
                          <div className="flex items-center space-x-1">
                            <span>Email</span>
                            {sortConfig?.key === "email" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => requestSort("createdAt")}>
                          <div className="flex items-center space-x-1">
                            <span>Registration Date</span>
                            {sortConfig?.key === "createdAt" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hidden lg:table-cell" onClick={() => requestSort("status")}>
                          <div className="flex items-center space-x-1">
                            <span>Status</span>
                            {sortConfig?.key === "status" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-4 w-4" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Skeleton className="h-6 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-20 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <Search className="h-12 w-12 mb-2 opacity-20" />
                              <h3 className="font-medium text-lg">No users found</h3>
                              <p>Try adjusting your search or filter criteria</p>
                              <Button
                                variant="link"
                                onClick={() => {
                                  setSearchTermState("")
                                  setStatusFilterState("all")
                                  setActivityFilterState("all")
                                  setDateRangeState({
                                    from: subDays(new Date(), 30),
                                    to: new Date(),
                                  })
                                  if (userManagementState) dispatch(resetFilters())
                                }}
                              >
                                Reset all filters
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow
                            key={user.id}
                            className={user.status === UserStatus.SUSPENDED ? "bg-red-50 dark:bg-red-950/10" : ""}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => handleUserSelect(user.id)}
                                aria-label={`Select ${user.firstName} ${user.lastName}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>
                                  {user.firstName} {user.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.createdAt ? (isNaN(new Date(user.createdAt).getTime()) ? 'Invalid Date' : formatDate(user.createdAt)) : "N/A"}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <StatusBadge status={user.isPortalAccess ? UserStatus.ACTIVE : UserStatus.INACTIVE} />
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewUserDetails(user)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View Details</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditUser(user)}
                                  title="Edit User"
                                >
                                  <PenSquare className="h-4 w-4" />
                                  <span className="sr-only">Edit User</span>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">More Options</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleViewUserTransactions(user)}>
                                      View Transactions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                      {user.isPortalAccess === true ? "Deactivate User" : "Activate User"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="mr-2 h-4 w-4" />
                                      Contact User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Impersonate User</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Mobile card layout */}
              <div className="sm:hidden space-y-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-12 w-12 mb-2 opacity-20" />
                        <h3 className="font-medium text-lg">No users found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                        <Button
                          variant="link"
                          onClick={() => {
                            setSearchTermState("")
                            setStatusFilterState("all")
                            setActivityFilterState("all")
                            setDateRangeState({
                              from: subDays(new Date(), 30),
                              to: new Date(),
                            })
                            if (userManagementState) dispatch(resetFilters())
                          }}
                        >
                          Reset all filters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredUsers.map((user) => (
                    <Card
                      key={user.id}
                      className={user.status === UserStatus.SUSPENDED ? "bg-red-50 dark:bg-red-950/10" : ""}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleUserSelect(user.id)}
                            aria-label={`Select ${user.firstName} ${user.lastName}`}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More Options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewUserTransactions(user)}>
                                View Transactions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                {user.isPortalAccess === true ? "Deactivate User" : "Activate User"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Contact User
                              </DropdownMenuItem>
                              <DropdownMenuItem>Impersonate User</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 space-y-2">
                          <div>
                            <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {user.email}
                          </div>
                          <div>
                            <span className="font-medium">Registered:</span>{" "}
                            {user.createdAt ? (isNaN(new Date(user.createdAt).getTime()) ? 'Invalid Date' : formatDate(user.createdAt)) : "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>{" "}
                            <StatusBadge status={user.isPortalAccess ? UserStatus.ACTIVE : UserStatus.INACTIVE} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Responsive pagination */}
              <div className="flex flex-col gap-3 py-4">
                {/* Results count - always visible */}
                <div className="flex justify-center sm:justify-start">
                  <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Showing {filteredUsers.length} of {totalItems} users
                  </p>
                </div>

                {/* Pagination controls */}
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-users">
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Active Users View</h3>
                <Badge variant="outline" className="text-muted-foreground">
                  {filteredUsers.filter(user => user.isPortalAccess).length} Active Users
                </Badge>
              </div>
              <div className="hidden sm:block rounded-md border">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                            onCheckedChange={handleSelectAllUsers}
                            aria-label="Select all users"
                          />
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort("lastName")}>
                          <div className="flex items-center space-x-1">
                            <span>Full Name</span>
                            {sortConfig?.key === "lastName" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort("email")}>
                          <div className="flex items-center space-x-1">
                            <span>Email</span>
                            {sortConfig?.key === "email" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => requestSort("createdAt")}>
                          <div className="flex items-center space-x-1">
                            <span>Registration Date</span>
                            {sortConfig?.key === "createdAt" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-4 w-4" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-20 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredUsers.filter(user => user.isPortalAccess).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <Search className="h-12 w-12 mb-2 opacity-20" />
                              <h3 className="font-medium text-lg">No active users found</h3>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.filter(user => user.isPortalAccess).map((user) => (
                          <TableRow
                            key={user.id}
                            className={user.isPortalAccess === true ? "bg-green-50 dark:bg-green-950/10" : ""}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => handleUserSelect(user.id)}
                                aria-label={`Select ${user.firstName} ${user.lastName}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>
                                  {user.firstName} {user.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.createdAt ? (isNaN(new Date(user.createdAt).getTime()) ? 'Invalid Date' : formatDate(user.createdAt)) : "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewUserDetails(user)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View Details</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditUser(user)}
                                  title="Edit User"
                                >
                                  <PenSquare className="h-4 w-4" />
                                  <span className="sr-only">Edit User</span>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">More Options</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleViewUserTransactions(user)}>
                                      View Transactions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                      {user.isPortalAccess === true ? "Deactivate User" : "Activate User"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="mr-2 h-4 w-4" />
                                      Contact User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Impersonate User</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Mobile card layout for active users */}
              <div className="sm:hidden space-y-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredUsers.filter(user => user.isPortalAccess).length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-12 w-12 mb-2 opacity-20" />
                        <h3 className="font-medium text-lg">No active users found</h3>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredUsers.filter(user => user.isPortalAccess).map((user) => (
                    <Card
                      key={user.id}
                      className={user.isPortalAccess === true ? "bg-green-50 dark:bg-green-950/10" : ""}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleUserSelect(user.id)}
                            aria-label={`Select ${user.firstName} ${user.lastName}`}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More Options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewUserTransactions(user)}>
                                View Transactions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                {user.isPortalAccess === true ? "Deactivate User" : "Activate User"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Contact User
                              </DropdownMenuItem>
                              <DropdownMenuItem>Impersonate User</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 space-y-2">
                          <div>
                            <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {user.email}
                          </div>
                          <div>
                            <span className="font-medium">Registered:</span>{" "}
                            {user.createdAt ? (isNaN(new Date(user.createdAt).getTime()) ? 'Invalid Date' : formatDate(user.createdAt)) : "N/A"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-verification">
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Pending Verification View</h3>
                <Badge variant="outline" className="text-muted-foreground">
                  {filteredUsers.filter(user => user.isPortalAccess === false).length} Pending Users
                </Badge>
              </div>
              <div className="hidden sm:block rounded-md border">
                <ScrollArea className="h-[600px] w-full">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                            onCheckedChange={handleSelectAllUsers}
                            aria-label="Select all users"
                          />
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort("lastName")}>
                          <div className="flex items-center space-x-1">
                            <span>Full Name</span>
                            {sortConfig?.key === "lastName" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort("email")}>
                          <div className="flex items-center space-x-1">
                            <span>Email</span>
                            {sortConfig?.key === "email" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => requestSort("createdAt")}>
                          <div className="flex items-center space-x-1">
                            <span>Registration Date</span>
                            {sortConfig?.key === "createdAt" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-4 w-4" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-20 ml-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredUsers.filter(user => user.isPortalAccess === false).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <Search className="h-12 w-12 mb-2 opacity-20" />
                              <h3 className="font-medium text-lg">No pending users found</h3>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.filter(user => user.isPortalAccess === false).map((user) => (
                          <TableRow
                            key={user.id}
                            className={user.isPortalAccess === false ? "bg-red-50 dark:bg-red-950/10" : ""}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={() => handleUserSelect(user.id)}
                                aria-label={`Select ${user.firstName} ${user.lastName}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>
                                  {user.firstName} {user.lastName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {user.createdAt ? (isNaN(new Date(user.createdAt).getTime()) ? 'Invalid Date' : formatDate(user.createdAt)) : "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewUserDetails(user)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View Details</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditUser(user)}
                                  title="Edit User"
                                >
                                  <PenSquare className="h-4 w-4" />
                                  <span className="sr-only">Edit User</span>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">More Options</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleViewUserTransactions(user)}>
                                      View Transactions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                      {user.isPortalAccess === true ? "Deactivate User" : "Activate User"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="mr-2 h-4 w-4" />
                                      Contact User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Impersonate User</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Mobile card layout for pending users */}
              <div className="sm:hidden space-y-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredUsers.filter(user => user.isPortalAccess === false).length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-12 w-12 mb-2 opacity-20" />
                        <h3 className="font-medium text-lg">No pending users found</h3>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredUsers.filter(user => user.isPortalAccess === false).map((user) => (
                    <Card
                      key={user.id}
                      className={user.isPortalAccess === false ? "bg-red-50 dark:bg-red-950/10" : ""}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleUserSelect(user.id)}
                            aria-label={`Select ${user.firstName} ${user.lastName}`}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More Options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewUserTransactions(user)}>
                                View Transactions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                {user.isPortalAccess === true ? "Deactivate User" : "Activate User"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Contact User
                              </DropdownMenuItem>
                              <DropdownMenuItem>Impersonate User</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 space-y-2">
                          <div>
                            <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {user.email}
                          </div>
                          <div>
                            <span className="font-medium">Registered:</span>{" "}
                            {user.createdAt ? (isNaN(new Date(user.createdAt).getTime()) ? 'Invalid Date' : formatDate(user.createdAt)) : "N/A"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Responsive User Detail Dialog */}
      {selectedUser && (
        <Dialog open={isDetailPanelOpen} onOpenChange={(open) => setIsDetailPanelOpenState(open)}>
          <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">User Details</DialogTitle>
              <DialogDescription className="text-sm">
                Viewing details for {selectedUser.firstName} {selectedUser.lastName}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="accounts">Accounts ({selectedUser._count?.accounts || 0})</TabsTrigger>
                <TabsTrigger value="transactions">Transactions ({selectedUser._count?.allTransactions || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Personal Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">User ID:</span>
                        <span className="text-right">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="text-right">{selectedUser.firstName} {selectedUser.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Email:</span>
                        <span className="text-right">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Phone:</span>
                        <span className="text-right">{selectedUser.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Role:</span>
                        <span className="text-right">{selectedUser.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Status:</span>
                        <StatusBadge status={selectedUser.isPortalAccess ? UserStatus.ACTIVE : UserStatus.INACTIVE} />
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Registration Date:</span>
                        <span className="text-right">{selectedUser.createdAt ? (isNaN(new Date(selectedUser.createdAt).getTime()) ? 'Invalid Date' : formatDate(selectedUser.createdAt)) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Last Updated:</span>
                        <span className="text-right">{formatDate(selectedUser.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Wallet Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Wallet ID:</span>
                        <span className="text-right">{selectedUser.wallet?.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Balance:</span>
                        <span className="text-right font-semibold text-green-600">
                          ${selectedUser.wallet?.balance ? parseFloat(selectedUser.wallet.balance).toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Wallet Created:</span>
                        <span className="text-right">{formatDate(selectedUser.wallet?.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Last Activity:</span>
                        <span className="text-right">{formatDate(selectedUser.wallet?.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Statistics</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="font-medium text-blue-800">Total Accounts</div>
                          <div className="text-2xl font-bold text-blue-600">{selectedUser._count?.accounts || 0}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="font-medium text-green-800">Add Money</div>
                          <div className="text-2xl font-bold text-green-600">{selectedUser._count?.addMoneyTransactions || 0}</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="font-medium text-orange-800">Transfers</div>
                          <div className="text-2xl font-bold text-orange-600">{selectedUser._count?.transferMoneyTransactions || 0}</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="font-medium text-purple-800">All Transactions</div>
                          <div className="text-2xl font-bold text-purple-600">{selectedUser._count?.allTransactions || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Notes</h3>
                  <Textarea
                    className="text-sm"
                    placeholder="Add notes about this user..."
                    value={selectedUser.notes || ""}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="accounts" className="mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Linked Accounts</h3>
                    <span className="text-sm text-gray-500">{selectedUser._count?.accounts || 0} accounts</span>
                  </div>

                  {selectedUser.accounts && selectedUser.accounts.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.accounts.map((account, index) => (
                        <div key={account.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <div className="font-medium text-gray-900 mb-2">Account #{index + 1}</div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Account Holder:</span>
                                  <span className="font-medium">{account.accountHolderName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Account Number:</span>
                                  <span className="font-mono">{account.accountNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">IFSC Code:</span>
                                  <span className="font-mono">{account.ifscCode}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 mb-2">Account Details</div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Account ID:</span>
                                  <span className="font-mono text-xs">{account.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Added:</span>
                                  <span>{formatDate(account.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Updated:</span>
                                  <span>{formatDate(account.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-lg">No accounts linked</div>
                      <div className="text-sm">User hasn't added any bank accounts yet.</div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="mt-4">
                <div className="space-y-6">
                  {/* Add Money Transactions */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Add Money Transactions</h3>
                      <span className="text-sm text-gray-500">{selectedUser._count?.addMoneyTransactions || 0} transactions</span>
                    </div>

                    {selectedUser.addMoneyTransactions && selectedUser.addMoneyTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.addMoneyTransactions.map((transaction) => (
                          <div key={transaction.id} className="border rounded-lg p-4 bg-green-50">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <div className="font-medium text-green-800 mb-2">₹{parseFloat(transaction.amount).toLocaleString()}</div>
                                <div className="text-sm text-gray-600">
                                  <div>Transaction ID: {transaction.transactionId}</div>
                                  <div>Status: <span className={`font-medium ${transaction.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>{transaction.status}</span></div>
                                </div>
                              </div>
                              <div className="text-sm">
                                <div className="text-gray-600">Location: {transaction.location}</div>
                                <div className="text-gray-600">Description: {transaction.description}</div>
                              </div>
                              <div className="text-sm text-right">
                                <div className="text-gray-600">Created: {formatDate(transaction.createdAt)}</div>
                                <div className="text-gray-600">Updated: {formatDate(transaction.updatedAt)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">No add money transactions</div>
                    )}
                  </div>

                  {/* Transfer Money Transactions */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Transfer Money Transactions</h3>
                      <span className="text-sm text-gray-500">{selectedUser._count?.transferMoneyTransactions || 0} transactions</span>
                    </div>

                    {selectedUser.transferMoneyTransactions && selectedUser.transferMoneyTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.transferMoneyTransactions.map((transaction) => (
                          <div key={transaction.id} className="border rounded-lg p-4 bg-orange-50">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <div className="font-medium text-orange-800 mb-2">₹{parseFloat(transaction.amount).toLocaleString()}</div>
                                <div className="text-sm text-gray-600">
                                  <div>Status: <span className={`font-medium ${transaction.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>{transaction.status}</span></div>
                                  <div>Description: {transaction.description}</div>
                                </div>
                              </div>
                              <div className="text-sm">
                                <div className="text-gray-600 font-medium">To Account:</div>
                                <div className="text-gray-600">{transaction.account?.accountHolderName}</div>
                                <div className="text-gray-600 font-mono">{transaction.account?.accountNumber}</div>
                                <div className="text-gray-600">{transaction.account?.ifscCode}</div>
                              </div>
                              <div className="text-sm text-right">
                                <div className="text-gray-600">Created: {formatDate(transaction.createdAt)}</div>
                                <div className="text-gray-600">Updated: {formatDate(transaction.updatedAt)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">No transfer transactions</div>
                    )}
                  </div>

                  {/* All Transactions */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">All Transactions</h3>
                      <span className="text-sm text-gray-500">{selectedUser._count?.allTransactions || 0} transactions</span>
                    </div>

                    {selectedUser.allTransactions && selectedUser.allTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.allTransactions.map((transaction) => (
                          <div key={transaction.id} className="border rounded-lg p-4 bg-purple-50">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <div className="font-medium text-purple-800 mb-2">₹{parseFloat(transaction.amount).toLocaleString()}</div>
                                <div className="text-sm text-gray-600">
                                  <div>Order ID: {transaction.orderId}</div>
                                  <div>Type: <span className="font-medium">{transaction.transactionType}</span></div>
                                </div>
                              </div>
                              <div className="text-sm">
                                <div className="text-gray-600">Description: {transaction.description}</div>
                                <div className="text-gray-600">Wallet ID: {transaction.walletId}</div>
                              </div>
                              <div className="text-sm text-right">
                                <div className="text-gray-600">Created: {formatDate(transaction.createdAt)}</div>
                                <div className="text-gray-600">Updated: {formatDate(transaction.updatedAt)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">No transactions</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setIsDetailPanelOpenState(false)}>
                Close
              </Button>
              <Button size="sm">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Responsive Bulk Action Dialog */}
      <Dialog open={isBulkActionDialogOpen} onOpenChange={(open) => setIsBulkActionDialogOpenState(open)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {bulkAction === "export"
                ? "Export Users"
                : bulkAction === "activate"
                  ? "Activate Users"
                  : bulkAction === "suspend"
                    ? "Suspend Users"
                    : bulkAction === "grantPortalAccess"
                      ? "Grant Portal Access"
                      : "Revoke Portal Access"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {bulkAction === "export"
                ? "Export data for the selected users."
                : bulkAction === "activate"
                  ? "Activate the selected users. This will allow them to log in and use the system."
                  : bulkAction === "suspend"
                    ? "Suspend the selected users. This will prevent them from logging in."
                    : bulkAction === "grantPortalAccess"
                      ? "Grant portal access to the selected users."
                      : "Revoke portal access from the selected users."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-0">
            {bulkAction === "export" ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="export-personal" defaultChecked />
                  <Label htmlFor="export-personal" className="text-sm">Personal Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="export-accounts" defaultChecked />
                  <Label htmlFor="export-accounts" className="text-sm">Bank Accounts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="export-transactions" defaultChecked />
                  <Label htmlFor="export-transactions" className="text-sm">Transaction History</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="export-activity" defaultChecked />
                  <Label htmlFor="export-activity" className="text-sm">Activity Log</Label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {bulkAction === "suspend" && (
                  <div className="rounded-md bg-red-50 p-4 dark:bg-red-950/20">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Warning</h3>
                        <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                          <p>
                            Suspending users will immediately prevent them from accessing the system and may interrupt
                            any ongoing operations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}