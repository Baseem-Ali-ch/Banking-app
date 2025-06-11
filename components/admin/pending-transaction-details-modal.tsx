"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/currency-utils"
import { formatDate } from "@/lib/utils"
import { AlertCircle, ArrowRight, Check, CheckCircle, Clock, Copy } from "lucide-react"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { processingTransferRequest, updateFundRequestStatusToProcessing } from "@/store/slices/transactionsSlice"

interface PendingTransactionDetailsModalProps {
  transaction: any
  open: boolean
  onClose: () => void
  onUpdateStatus: (transactionId: string, newStatus: string, data?: any) => void
}

export function PendingTransactionDetailsModal({
  transaction,
  open,
  onClose,
  onUpdateStatus,
}: PendingTransactionDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMode, setUpdateMode] = useState<"processing" | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const dispatch = useDispatch()

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCopyIcon, setShowCopyIcon] = useState(false)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setShowCopyIcon(true)
    setTimeout(() => {
      setShowCopyIcon(false)
    }, 2000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "REJECTED":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "PROCESSING":
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }
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


  const handleUpdateToProcessing = async () => {
    if (!transactionId.trim()) {
      toast.warning("Transaction ID is Required", {
        description: "Please enter a valid transaction ID.",
        duration: 1500,
        position: 'top-right'
      })
      return
    }

    setIsUpdating(true)
    try {
      let result

      if (transaction.transactionType === "ADD_MONEY") {
        result = await dispatch(updateFundRequestStatusToProcessing({
          id: transaction.id,
          transactionId: transactionId.trim()
        })).unwrap()
      } else {
        result = await dispatch(processingTransferRequest({
          id: transaction.id,
          transactionId: transactionId.trim()
        })).unwrap()
      }

      setUpdateMode(null)
      setTransactionId("")

      toast.success("Request Updated", {
        description: result.message ||
          transaction.transactionType === "ADD_MONEY"
          ? "Fund request has been updated to processing status."
          : "Transfer request has been updated to processing status.",
        duration: 1500,
        position: 'top-right'
      })

      handleClose()

    } catch (error) {
      toast.error("Update Failed", {
        description: error instanceof Error ? error.message :
          transaction.transactionType === "ADD_MONEY"
            ? "Failed to update fund request status"
            : "Failed to update transfer request status",
        duration: 1500,
        position: 'top-right'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClose = () => {
    setUpdateMode(null)
    setTransactionId("")
    onClose()
  }

  const renderUpdateSection = () => {
    if (!updateMode) return null

    return (
      <div className="mt-4 p-4 border rounded-md bg-blue-50">
        <h3 className="text-lg font-semibold mb-3">Update to Processing</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID *</Label>
            <Input
              id="transactionId"
              placeholder="Enter transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUpdateMode(null)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateToProcessing} disabled={!transactionId.trim() || isUpdating}>
              {isUpdating ? "Processing..." : "Update Status"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(transaction.status)}
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{transaction.description}</h3>
                <p className="text-sm text-muted-foreground">{transaction.transactionType === "TRANSFER_MONEY" ? "TRANSFER MONEY" : "ADD MONEY"}</p>
              </div>
              {getStatusBadge(transaction.status)}
            </div>

            <div className="text-2xl font-bold">
              <span
                className={`font-semibold ${transaction.transactionType === "TRANSFER_MONEY" ? "text-red-600" : "text-green-600"}`}
              >
                {transaction.transactionType === "TRANSFER_MONEY" ? "-" : "+"}${transaction.amount}.00
              </span>
            </div>
          </div>

          <Separator />

          {/* Request Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Request Details</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-medium">ID</p>
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground capitalize">{transaction.id}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(transaction.id, 'id')}
                        className="p-1"
                      >
                        {showCopyIcon && copiedId === 'id' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-medium">Updated</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {transaction.transactionId && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium">ID</p>
                      <div className="flex items-center">
                        <p className="text-sm text-muted-foreground capitalize">{transaction.transactionId}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(transaction.transactionId, 'transactionId')}
                          className="p-1"
                        >
                          {showCopyIcon && copiedId === 'transactionId' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Account Information Section */}
          {transaction.transactionType === "TRANSFER_MONEY" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">Account Holder</p>
                        <p className="text-sm text-muted-foreground">{transaction.account.accountHolderName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">Account Number</p>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground capitalize">{transaction.account.accountNumber}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(transaction.account.accountNumber, 'accountNumber')}
                            className="p-1"
                          >
                            {showCopyIcon && copiedId === 'accountNumber' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">IFSC Code</p>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground">{transaction.account.ifscCode}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(transaction.account.ifscCode, 'ifscCode')}
                            className="p-1"
                          >
                            {showCopyIcon && copiedId === 'ifscCode' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">Account ID</p>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground capitalize">{transaction.account.id}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(transaction.account.id, 'accountId')}
                            className="p-1"
                          >
                            {showCopyIcon && copiedId === 'accountId' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* User Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">User Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">Request By</p>
                        <p className="text-sm text-muted-foreground">{transaction.user.firstName + ' ' + transaction.user.lastName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground capitalize">{transaction.user.email}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(transaction.user.email, 'email')}
                            className="p-1"
                          >
                            {showCopyIcon && copiedId === 'email' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground capitalize">{transaction.user.phoneNumber}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(transaction.user.phoneNumber, 'phoneNumber')}
                            className="p-1"
                          >
                            {showCopyIcon && copiedId === 'phoneNumber' ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Status Update Section */}
          {renderUpdateSection()}
        </div>

        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>

          {/* Status Update Button */}
          {transaction.status === "PENDING" && !updateMode && (
            <Button onClick={() => setUpdateMode("processing")} className="bg-blue-600 hover:bg-blue-700">
              <ArrowRight className="mr-2 h-4 w-4" />
              Update to Processing
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
