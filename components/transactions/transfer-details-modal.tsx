"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, CreditCard, User, Building, Hash, AlertCircle, CheckCircle, Clock, ArrowUpRight, MapPin, Check, Copy, Mail } from "lucide-react"
import { useState } from "react"

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: any
}

export function TransferDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  if (!transaction) return null

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(transaction.status)}
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{transaction.description}</h3>
              </div>
              {getStatusBadge(transaction.status)}
            </div>

            <div className="text-2xl font-bold">
              <span className="text-red-600">
                - ₹{transaction.amount}.00
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
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ID</p>
                    <div className="flex items-center gap-2">
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
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Updated</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Transaction ID</p>
                    <div className="flex items-center gap-2">
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
            </div>
          </div>

          <Separator />

          {/* Account Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Holder</p>
                    <p className="text-sm text-muted-foreground">{transaction.account.accountHolderName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Number</p>
                    <div className="flex items-center gap-2">
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
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">IFSC Code</p>
                    <div className="flex items-center gap-2">
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
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account ID</p>
                    <div className="flex items-center gap-2">
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
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Request By</p>
                    <p className="text-sm text-muted-foreground">{transaction.user.firstName + ' ' + transaction.user.lastName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <div className="flex items-center gap-2">
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
