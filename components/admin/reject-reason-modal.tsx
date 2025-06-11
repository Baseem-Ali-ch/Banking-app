"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RejectReasonModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
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

export function RejectReasonModal({ open, onClose, onSubmit }: RejectReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const reason = selectedReason === "Other" ? customReason.trim() : selectedReason
    if (!reason) return

    setIsSubmitting(true)
    try {
      await onSubmit(reason)
      setSelectedReason("")
      setCustomReason("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedReason("")
    setCustomReason("")
    onClose()
  }

  const isValid = selectedReason && (selectedReason !== "Other" || customReason.trim())

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Reject Fund Request</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this fund request. This will be communicated to the user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Rejecting..." : "Reject Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
