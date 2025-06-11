"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchAccount, fetchAccountTransactions } from "@/store/slices/accountsSlice"
import { ArrowLeft, Edit, ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BankIcon } from "@/components/accounts/bank-icon"
import { AccountDetailsSkeleton } from "@/components/accounts/account-details-skeleton"
import { cn } from "@/lib/utils"
import { TransactionStatus, TransactionType } from "@/types"
import { formatCurrency } from "@/lib/currency-utils"
import { toast } from 'sonner'

interface AccountDetailsProps {
  id: string
}

export function AccountDetails({ id }: AccountDetailsProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { selectedAccount, isLoading, error } = useAppSelector((state) => state.accounts)
  const { currency } = useAppSelector((state) => state.settings)

  useEffect(() => {
    dispatch(fetchAccount(id))
    // dispatch(fetchAccountTransactions(id))
  }, [dispatch, id])

  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error || "Please try again",
        duration: 1500,
        position: 'top-right'
      })
    }
  }, [error])

  const handleEdit = () => {
    router.push(`/dashboard/accounts/edit/${id}`)
  }

  const handleNewTransfer = () => {
    router.push(`/dashboard/transfer?fromAccount=${id}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return "text-yellow-500"
      case TransactionStatus.COMPLETED:
        return "text-green-500"
      case TransactionStatus.REJECTED:
        return "text-red-500"
      case TransactionStatus.CANCELLED:
        return "text-gray-500"
      default:
        return "text-muted-foreground"
    }
  }

  if (isLoading || !selectedAccount) {
    return <AccountDetailsSkeleton />
  }

  return (
    <div className="container px-4 py-6 pb-20">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Account Details</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BankIcon bankName={selectedAccount?.bankName || ""} className="h-8 w-8" />
                <div>
                  <CardTitle>{selectedAccount?.accountHolderName || ""}</CardTitle>
                  <CardDescription>{"•••• " + selectedAccount?.ifscCode?.slice(-4)}</CardDescription>
                </div>
              </div>
              {selectedAccount.isDefault && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Default
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium">•••• •••• •••• {selectedAccount?.accountNumber?.slice(-4)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account Holder</p>
                  <p className="font-medium">{selectedAccount.accountHolderName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IFSC Code</p>
                  <p className="font-medium font-mono">{selectedAccount.ifscCode || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={handleNewTransfer} className="w-full">
              New Transfer
            </Button>
            <div className="flex w-full gap-3">
              <Button variant="outline" onClick={handleEdit} className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // This would open a statement or detailed view
                  toast.info("Feature coming soon", {
                    description: "Account statements will be available in a future update.",
                    duration: 1500,
                    position: 'top-right'
                  })
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Statement
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
