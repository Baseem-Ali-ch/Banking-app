'use client'

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw } from "lucide-react"
import { PendingTransactionsTable } from "@/components/admin/pending-transactions-table"
import { PendingTransactionDetailsModal } from "@/components/admin/pending-transaction-details-modal"
import { fetchAllPendingTransactions } from "@/store/slices/transactionsSlice"
import { selectPendingTransactions, selectPendingTransactionsLoading, selectPendingTransactionsPagination } from "@/store/slices/transactionsSlice"
import { AdminPagination } from "@/components/admin/pagination"

export default function PendingTransactionsPage() {
  const dispatch = useDispatch()
  const transactions = useSelector(selectPendingTransactions)
  const isLoading = useSelector(selectPendingTransactionsLoading)
  const pagination = useSelector(selectPendingTransactionsPagination)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchAllPendingTransactions({ page: currentPage, limit: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsModalOpen(true)
  }

  const handleRefresh = () => {
    dispatch(fetchPendingTransactions({ page: currentPage, limit: itemsPerPage }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pending Transactions</h1>
          <p className="text-muted-foreground">Manage pending transactions awaiting processing</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Total Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {transactions.filter((t) => t.type === "TRANSFER").length}
            </div>
            <p className="text-xs text-muted-foreground">Transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter((t) => t.type === "DEPOSIT").length}
            </div>
            <p className="text-xs text-muted-foreground">Deposits</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, description, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <PendingTransactionsTable
            transactions={filteredTransactions}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />

          <AdminPagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={pagination.total}
          />
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedTransaction && (
        <PendingTransactionDetailsModal
          transaction={selectedTransaction}
          open={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  )
}
