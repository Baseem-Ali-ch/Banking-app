"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { sendFromWallet, addPendingTransaction, getWalletDetails } from "@/store/slices/walletSlice"
import type { WalletTransaction } from "@/types"
import { formatCurrency } from "@/lib/currency-utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { fetchAccounts } from "@/store/slices/accountsSlice"
import { toast } from 'sonner'

export const WalletSendForm = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { wallet, isLoading: walletLoading, error: walletError } = useAppSelector((state) => state.wallet)
  const { accounts, isLoading: accountsLoading, error: accountsError } = useAppSelector((state) => state.accounts)

  const [amount, setAmount] = useState("")
  const [bankAccountId, setBankAccountId] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<{ amount?: string; bankAccountId?: string }>({})

  useEffect(() => {
    // Ensure wallet data is loaded
    if (!wallet && !walletLoading) {
      dispatch(getWalletDetails())
    }
    // Ensure accounts data is loaded
    if (!accounts.length && !accountsLoading) {
      dispatch(fetchAccounts())
    }
  }, [dispatch, wallet, accounts, walletLoading, accountsLoading])

  // Check if user has sufficient balance
  const hasSufficientBalance = wallet && Number(amount) <= wallet.balance

  useEffect(() => {
    // Set the first account as default if available
    if (accounts.length > 0 && !bankAccountId) {
      setBankAccountId(accounts[0].id)
    }
  }, [accounts, bankAccountId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setErrors({})

    // Validate form
    let isValid = true
    const newErrors: typeof errors = {}

    if (!amount) {
      newErrors.amount = "Amount is required"
      isValid = false
    } else if (Number(amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0"
      isValid = false
    }

    if (!bankAccountId) {
      newErrors.bankAccountId = "Please select a bank account"
      isValid = false
    }

    setErrors(newErrors)

    if (!isValid) return

    if (!hasSufficientBalance) {
      toast.error("Insufficient Balance", {
        description: "You don't have enough balance in your wallet",
        duration: 1500,
        position: "top-right"
      })
      return
    }

    try {
      // Send money
      const result = await dispatch(sendFromWallet({
        amount: Number(amount),
        accountId: bankAccountId,
        description: "Transfer Money"
      })).unwrap()

      // Show success message
      toast.success("Transfer successful", {
        description: result?.message || "Money has been sent to bank account",
        duration: 1500,
        position: 'top-right'
      })

      router.push("/dashboard");

    } catch (error: any) {
      console.error("Error sending money:", error)
      toast.error("Transfer failed", {
        description: error?.message || "Failed to send money to bank account",
        duration: 1500,
        position: 'top-right'
      })
    }
  }

  const renderWalletBalance = () => {
    if (walletLoading) {
      return (
        <span className="text-sm text-muted-foreground flex items-center">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Loading balance...
        </span>
      )
    }
    
    if (walletError || !wallet) {
      return (
        <span className="text-sm text-red-500 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Error loading wallet
        </span>
      )
    }
    
    return (
      <span className="text-sm text-muted-foreground">
        Available: {formatCurrency(wallet.balance, wallet.currency)}
      </span>
    )
  }

  const renderAccountSelect = () => {
    if (accountsLoading) {
      return (
        <Select disabled>
          <SelectTrigger id="bankAccount">
            <SelectValue>
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading accounts...
              </div>
            </SelectValue>
          </SelectTrigger>
        </Select>
      )
    }

    if (accountsError) {
      return (
        <Select disabled>
          <SelectTrigger id="bankAccount" className="border-red-200">
            <SelectValue>
              <div className="flex items-center text-red-500">
                <AlertCircle className="h-4 w-4 mr-2" />
                Error loading accounts
              </div>
            </SelectValue>
          </SelectTrigger>
        </Select>
      )
    }

    return (
      <Select value={bankAccountId} onValueChange={setBankAccountId}>
        <SelectTrigger id="bankAccount">
          <SelectValue placeholder="Select a bank account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.length === 0 ? (
            <SelectItem value="no-accounts" disabled>
              No bank accounts available
            </SelectItem>
          ) : (
            accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.accountHolderName} - (****{account.accountNumber.slice(-4)})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    )
  }

  const renderAccountError = () => {
    if (accountsError) {
      return (
        <div className="flex items-start mt-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5" />
          <span>Failed to load bank accounts. Please try refreshing the page.</span>
        </div>
      )
    }

    if (!accountsLoading && accounts.length === 0) {
      return (
        <div className="flex items-start mt-2 text-sm text-amber-600">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5" />
          <span>
            You need to add a bank account before you can send funds.{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-primary underline"
              onClick={() => router.push("/dashboard/accounts/new")}
            >
              Add a bank account
            </Button>
          </span>
        </div>
      )
    }

    return null
  }

  return (
    <div className="container px-4 py-6 pb-20">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mr-2 p-0 h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Send Money</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send to Bank Account</CardTitle>
          <CardDescription>Transfer funds from your wallet to your bank account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="amount">Amount</Label>
                  {renderWalletBalance()}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {wallet?.currency === "USD"
                      ? "$"
                      : wallet?.currency === "EUR"
                        ? "€"
                        : wallet?.currency === "GBP"
                          ? "£"
                          : wallet?.currency === "SAR"
                            ? "﷼"
                            : "$"}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    disabled={walletLoading || walletError || !wallet}
                  />
                </div>
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}

                {amount && !hasSufficientBalance && wallet && (
                  <div className="flex items-start mt-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1 mt-0.5" />
                    <span>Insufficient balance to cover send amount and fees</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account</Label>
                {renderAccountSelect()}
                {errors.bankAccountId && <p className="text-sm text-red-500">{errors.bankAccountId}</p>}
                {renderAccountError()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a note for this transaction"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  walletLoading || 
                  accountsLoading || 
                  walletError || 
                  accountsError || 
                  !wallet || 
                  !hasSufficientBalance || 
                  accounts.length === 0
                }
              >
                {walletLoading || accountsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Send Money"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-muted-foreground border-t pt-4">
          <p className="mb-2">
            <strong>Note:</strong> Send requests require admin approval and typically take 1-3 business days to process.
          </p>
          <p>By proceeding, you agree to our terms and conditions regarding money transfers and wallet usage.</p>
        </CardFooter>
      </Card>
    </div>
  )
}