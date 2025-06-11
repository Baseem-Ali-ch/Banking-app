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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/currency-utils"
import { formatDate } from "@/lib/utils"
import { Download, ExternalLink, ArrowRight, CheckCircle, XCircle, Loader2, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { updateFundRequestStatusToProcessing, approveFundRequest, rejectFundRequest } from "@/store/slices/transactionsSlice"

interface FundRequest {
  id: string
  userId: string
  amount: number
  currency: string
  location: string
  description: string
  status: string
  transactionId: string | null
  createdAt: string
  updatedAt: string
  rejectionReason: string | null
  notes: string | null
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
}

interface FundRequestDetailsModalProps {
  request: FundRequest
  open: boolean
  onClose: () => void
  onUpdateStatus: (requestId: string, newStatus: string, data?: any) => void
}

const predefinedReasons = [
  "Insufficient documentation",
  "Invalid bank details",
  "Suspicious activity detected",
  "Account verification failed",
  "Duplicate request",
  "Amount exceeds limit",
  "Other",
]

export function FundRequestDetailsModal({ request, open, onClose, onUpdateStatus }: FundRequestDetailsModalProps) {
  const dispatch = useDispatch()
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMode, setUpdateMode] = useState<"processing" | "approve" | "reject" | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
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
      const result = await dispatch(updateFundRequestStatusToProcessing({
        id: request.id,
        transactionId: transactionId.trim()
      })).unwrap()

      setUpdateMode(null)
      setTransactionId("")
      toast.success("Request Updated", {
        description: result.message || "Fund request has been updated to processing status.",
        duration: 1500,
        position: 'top-right'
      })

      handleClose()

    } catch (error) {
      toast.error("Update Failed", {
        description: error instanceof Error ? error.message : "Failed to update fund request status",
        duration: 1500,
        position: 'top-right'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleApprove = async () => {
    if (!request.id) return;

    setIsUpdating(true);
    try {
      const result = await dispatch(approveFundRequest({
        id: request.id,
      })).unwrap();

      toast.success("Request Approved", {
        description: result.message || "Fund request has been approved.",
        duration: 1500,
        position: 'top-right'
      });
      handleClose()


    } catch (error: any) {
      toast.error("Approval Failed", {
        description: error.message || "Failed to approve fund request",
        duration: 1500,
        position: 'top-right'
      });
      handleClose()


    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!request.id) return;

    setIsUpdating(true);
    try {
      const result = await dispatch(rejectFundRequest({
        id: request.id,
        reason: selectedReason === "Other" ? customReason.trim() : selectedReason
      })).unwrap();

      toast.success("Request Rejected", {
        description: result.message || "Fund request has been rejected successfully.",
        duration: 1500,
        position: 'top-right'
      });

      handleClose()

    } catch (error: any) {
      toast.error("Rejection Failed", {
        description: error.message || "Failed to reject fund request",
        duration: 1500,
        position: 'top-right'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setUpdateMode(null)
    setTransactionId("")
    setSelectedReason("")
    setCustomReason("")
    onClose()
  }

  const renderUpdateSection = () => {
    if (!updateMode) return null

    switch (updateMode) {
      case "processing":
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

      case "reject":
        return (
          <div className="mt-4 p-4 border rounded-md bg-red-50">
            <h3 className="text-lg font-semibold mb-3 text-red-600">Reject Request</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReason === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="customReason">Custom Reason *</Label>
                  <Textarea
                    id="customReason"
                    placeholder="Enter custom rejection reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUpdateMode(null)} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )

      case "approve":
        return (
          <div className="mt-4 p-4 border rounded-md bg-green-50">
            <h3 className="text-lg font-semibold mb-3 text-green-600">Approve Request</h3>
            <p className="mb-3">Are you sure you want to approve this fund request?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUpdateMode(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Fund Request Details
            {getStatusBadge(request.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Request Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="text-2xl font-bold text-green-600">
                  +{request.amount}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p>{request.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p>{formatDate(request.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID</label>
                <div className="flex items-center gap-2">
                  <p>{request.id}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(request.id, 'id')}
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
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated</label>
                <p>{formatDate(request.updatedAt)}</p>
              </div>
              {request.transactionId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                  <div className="flex items-center gap-2">
                    <p>{request.transactionId}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(request.transactionId || '', 'transactionId')}
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
              )}
            </div>
          </div>

          <Separator />

          {/* User Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-medium">{request.user.firstName + " " + request.user.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2">
                  <p>{request.user.email}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(request.user.email, 'email')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <div className="flex items-center gap-2">
                  <p>{request.user.phoneNumber}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(request.user.phoneNumber, 'phoneNumber')}
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

          <Separator />

          {/* Rejection Reason */}
          {request.rejectionReason && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600">Rejection Reason</h3>
                <p className="text-red-700 bg-red-50 p-3 rounded-md border border-red-200">{request.rejectionReason}</p>
              </div>
            </>
          )}

          {/* Notes */}
          {request.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">{request.notes}</p>
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

          {/* Status Update Buttons */}
          {request.status === "PENDING" && !updateMode && (
            <Button onClick={() => setUpdateMode("processing")} className="bg-blue-600 hover:bg-blue-700">
              <ArrowRight className="mr-2 h-4 w-4" />
              Update to Processing
            </Button>
          )}

          {request.status === "PROCESSING" && !updateMode && (
            <>
              <Button onClick={() => setUpdateMode("approve")} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button onClick={() => setUpdateMode("reject")} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
