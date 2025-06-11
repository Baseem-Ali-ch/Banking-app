import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TransactionStatus } from "@/types"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/currency-utils"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllTransactions } from "@/store/slices/transactionsSlice"
import { selectAllTransactions, selectAllTransactionsLoading } from "@/store/slices/transactionsSlice"
import { useEffect } from "react"

export function RecentTransactions() {
  const dispatch = useDispatch()
  const router = useRouter()
  const allTransactions = useSelector(selectAllTransactions)
  const loading = useSelector(selectAllTransactionsLoading)

  useEffect(() => {
    dispatch(fetchAllTransactions())
  }, [dispatch])

  // Sort and limit to latest 5 transactions
  const latestTransactions = allTransactions
    ? [...allTransactions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    }
    return date.toLocaleDateString("en-US", { 
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getTransactionIcon = (transaction: any) => {
    if (transaction.transactionType === "DEPOSIT") {
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />
    } else if (transaction.transactionType === "WITHDRAWAL") {
      return <ArrowUpRight className="h-4 w-4 text-red-600" />
    }
    return <ArrowRight className="h-4 w-4 text-gray-600" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="text-green-600">✓</span>
      case "PENDING":
        return <span className="text-yellow-600">•</span>
      case "FAILED":
        return <span className="text-red-600">✗</span>
      default:
        return <span className="text-gray-600">•</span>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1"
          onClick={() => router.push("/dashboard/transactions")}
        >
          View All <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      <Card>
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-sm font-medium">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <span>Loading...</span>
            </div>
          ) : latestTransactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {latestTransactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getTransactionIcon(transaction)}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right min-w-[100px]">
                      <div
                        className={cn(
                          "font-medium",
                          transaction.transactionType === "DEPOSIT" ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {transaction.transactionType === "DEPOSIT" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Balance: {formatCurrency(transaction.wallet.balance)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Handle transaction details view
                        router.push(`/transactions/${transaction.id}`)
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
