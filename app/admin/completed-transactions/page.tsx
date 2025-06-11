"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw } from "lucide-react"
import { CompletedTransactionsTable } from "@/components/admin/completed-transactions-table"
import { CompletedTransactionDetailsModal } from "@/components/admin/completed-transaction-details-modal"
import { fetchAllCompletedTransactions } from "@/store/slices/transactionsSlice"
import { selectCompletedTransactions, selectCompletedTransactionsLoading, selectCompletedTransactionsPagination } from "@/store/slices/transactionsSlice"
import { AdminPagination } from "@/components/admin/pagination"
import { toast } from "@/components/ui/use-toast"

export default function CompletedTransactionsPage() {
  const dispatch = useDispatch()
  const transactions = useSelector(selectCompletedTransactions)
  const isLoading = useSelector(selectCompletedTransactionsLoading)
  const pagination = useSelector(selectCompletedTransactionsPagination)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    dispatch(fetchAllCompletedTransactions({ page: currentPage, limit: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  // Filter transactions based on search and type
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = !typeFilter || transaction.transactionType === typeFilter

    return matchesSearch && matchesType
  })

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setShowDetailsModal(true)
  }

  const handleRefresh = () => {
    dispatch(fetchAllCompletedTransactions({ page: currentPage, limit: itemsPerPage }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Completed Transactions</h1>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          <CompletedTransactionsTable
            transactions={filteredTransactions}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />

          <AdminPagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={pagination.total}
          />
        </CardContent>
      </Card>

      {/* Details Modal */}
      {selectedTransaction && (
        <CompletedTransactionDetailsModal
          transaction={selectedTransaction}
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  )
}
