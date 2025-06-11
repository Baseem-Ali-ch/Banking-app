"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchTransactions } from "@/store/slices/transactionsSlice"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter, Search, RefreshCw, CheckCircle } from "lucide-react"
import { TransactionTable } from "@/components/admin/transaction-management/transaction-table"
import { TransactionFilterDrawer } from "@/components/admin/transaction-management/transaction-filter-drawer"
import { TransactionStats } from "@/components/admin/transaction-management/transaction-stats"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import type { Transaction } from "@/types"
import { AdminPagination } from "@/components/admin/pagination"
import { TransactionDetailsModal } from "@/components/transactions/transaction-details-modal"

export default function TransactionsPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const {
    transactions,
    filteredTransactions,
    isLoading,
    currentPage,
    itemsPerPage,
    transactionsPagination,
  } = useAppSelector((state) => state.transactions)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchTransactions({ page: currentPage, limit: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  const pendingTransactions = filteredTransactions.filter((transaction) => transaction.status === "PENDING")

  const rejectedTransactions = filteredTransactions.filter((transaction) => transaction.status === "REJECTED")

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDetailsModalOpen(true)
  }

  const handleRefresh = () => {
    dispatch(fetchTransactions({ page: currentPage, limit: itemsPerPage }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (page: number) => {
    dispatch(fetchTransactions({ page, limit: itemsPerPage }))
  }

  const handleItemsPerPageChange = (limit: number) => {
    dispatch(fetchTransactions({ page: 1, limit }))
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">View and manage all transactions</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="w-full pl-8 sm:w-[300px]"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* <TransactionStats /> */}

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              All Transactions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsContent value="all">
              <TransactionTable
                transactions={filteredTransactions}
                isLoading={isLoading}
                onViewTransaction={handleViewTransaction}
              />
              <AdminPagination
                currentPage={currentPage}
                totalPages={transactionsPagination.totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={transactionsPagination.total}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TransactionFilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <TransactionDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  )
}
