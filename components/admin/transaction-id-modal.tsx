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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface TransactionIdModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (transactionId: string, notes?: string) => void
}

export function TransactionIdModal({ open, onClose, onSubmit }: TransactionIdModalProps) {
  const [transactionId, setTransactionId] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!transactionId.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(transactionId.trim(), notes.trim() || undefined)
      setTransactionId("")
      setNotes("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setTransactionId("")
    setNotes("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update to Processing</DialogTitle>
          <DialogDescription>Enter the transaction ID to mark this fund request as processing.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!transactionId.trim() || isSubmitting}>
            {isSubmitting ? "Processing..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
