'use client'

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw } from "lucide-react"
import { ProcessingTransactionsTable } from "@/components/admin/processing-transactions-table"
import { ProcessingTransactionDetailsModal } from "@/components/admin/processing-transaction-details-modal"
import { RejectReasonModal } from "@/components/admin/reject-reason-modal"
import { approveFundRequest, approveTransferRequest, fetchAllProcessingTransactions, rejectFundRequest, rejectTransferRequest } from "@/store/slices/transactionsSlice"
import { selectProcessingTransactions, selectProcessingTransactionsLoading, selectProcessingTransactionsPagination } from "@/store/slices/transactionsSlice"
import { AdminPagination } from "@/components/admin/pagination"
import { toast } from "sonner"

interface ProcessingTransaction {
  id: string;
  type: 'ADD_MONEY' | 'TRANSFER_MONEY';
  user: {
    firstName: string;
    email: string;
  };
  description: string;
}

export default function ProcessingTransactionsPage() {
  const dispatch = useDispatch()
  const transactions = useSelector(selectProcessingTransactions)
  const isLoading = useSelector(selectProcessingTransactionsLoading)
  const pagination = useSelector(selectProcessingTransactionsPagination)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedTransaction, setSelectedTransaction] = useState<ProcessingTransaction | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    dispatch(fetchAllProcessingTransactions({ page: currentPage, limit: itemsPerPage }))
  }, [dispatch, currentPage, itemsPerPage])

  // Filter transactions based on search and type
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = !typeFilter || transaction.type === typeFilter

    return matchesSearch && matchesType
  })

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setShowDetailsModal(true)
  }

  const handleApprove = async () => {
    if (!selectedTransaction?.id) return;

    setIsUpdating(true);
    try {
      const dispatchFunction = selectedTransaction.type === 'ADD_MONEY' 
        ? approveFundRequest 
        : approveTransferRequest;

      const result = await dispatch(dispatchFunction({
        id: selectedTransaction.id,
      })).unwrap();

      toast.success("Request Approved", {
        description: result.message || `${selectedTransaction.type === 'ADD_MONEY' ? 'Fund' : 'Transfer'} request has been approved.`,
        duration: 1500,
        position: 'top-right'
      });
      handleClose()
    } catch (error: any) {
      toast.error("Approval Failed", {
        description: error.message || `Failed to approve ${selectedTransaction.type === 'ADD_MONEY' ? 'fund' : 'transfer'} request`,
        duration: 1500,
        position: 'top-right'
      });
      handleClose()
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction?.id) return;

    setIsUpdating(true);
    try {
      const dispatchFunction = selectedTransaction.type === 'ADD_MONEY' 
        ? rejectFundRequest 
        : rejectTransferRequest;

      const result = await dispatch(dispatchFunction({
        id: selectedTransaction.id,
        reason: selectedReason === "Other" ? customReason.trim() : selectedReason
      })).unwrap();

      toast.success("Request Rejected", {
        description: result.message || `${selectedTransaction.type === 'ADD_MONEY' ? 'Fund' : 'Transfer'} request has been rejected successfully.`,
        duration: 1500,
        position: 'top-right'
      });
      handleClose()
    } catch (error: any) {
      toast.error("Rejection Failed", {
        description: error.message || `Failed to reject ${selectedTransaction.type === 'ADD_MONEY' ? 'fund' : 'transfer'} request`,
        duration: 1500,
        position: 'top-right'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectReason = () => {
    setShowRejectModal(true)
  }

  const handleClose = () => {
    setSelectedTransaction(null)
    setShowDetailsModal(false)
    setShowRejectModal(false)
    setRejectionReason("")
    setCustomReason("")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Processing Transactions</h1>
        <Button variant="outline" onClick={() => dispatch(fetchAllProcessingTransactions({ page: currentPage, limit: itemsPerPage }))}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processing Transactions</CardTitle>
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

          <ProcessingTransactionsTable
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

      {/* Modals */}
      {selectedTransaction && (
        <ProcessingTransactionDetailsModal
          transaction={selectedTransaction}
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onApprove={handleApprove}
          onReject={handleRejectReason}
          isLoading={isLoading}
        />
      )}

      <RejectReasonModal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onSubmit={handleReject}
      />
    </div>
  )
}
