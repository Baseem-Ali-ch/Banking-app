"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowDownLeft,
  BarChart3,
  CheckCircle,
  CreditCard,
  DollarSign,
  Users,
  XCircle,
  Loader2,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency-utils"
import { AdminRecentTransactions } from "./admin-recent-transactions"
import { AdminRecentUsers } from "./admin-recent-users"
import { AdminActivityLog } from "./admin-activity-log"
import { AdminStatsOverview } from "./admin-stats-overview"
import { api } from "@/api/client"
import { toast } from "@/components/ui/use-toast"

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface TransactionStats {
  count: number;
  amount?: number;
}

interface Stats {
  totalUsers: number;
  transactions: {
    completed: TransactionStats;
    pending: TransactionStats;
    processing: TransactionStats;
    rejected: TransactionStats;
    addMoney: {
      completed: number;
      pending: number;
      processing: number;
      rejected: number;
      totalAmount: number;
    };
    transferMoney: {
      completed: number;
      pending: number;
      processing: number;
      rejected: number;
      totalAmount: number;
    };
  };
}

interface AddMoneyTransaction {
  id: string;
  amount: number;
  location: string;
  description: string;
  transactionId: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  allTransaction: {
    orderId: string;
  };
}

interface TransferMoneyTransaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  account: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
  allTransaction: {
    orderId: string;
  };
}

interface AllTransaction {
  id: string;
  orderId: string;
  walletId: string;
  userId: string;
  amount: number;
  transactionType: string;
  description: string;
  addMoneyTransactionId: string | null;
  transferMoneyTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  addMoneyTransaction: AddMoneyTransaction | null;
  transferMoneyTransaction: TransferMoneyTransaction | null;
}

interface RecentTransactions {
  addMoney: AddMoneyTransaction[];
  transferMoney: TransferMoneyTransaction[];
  all: AllTransaction[];
}

interface DashboardData {
  stats: Stats;
  recentTransactions: RecentTransactions;
}

export function AdminDashboardContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/admin/dashboard')

      // Check if the request was successful
      if (response.data && response.success) {
        const data = response.data
        return data
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const dashboardData = await fetchDashboardData()
      if (dashboardData) {
        setData(dashboardData)
      }
    }
    fetchData()
  }, [])

  // Handle transaction click
  const handleTransactionClick = (id: string) => {
    router.push(`/admin/transactions/${id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of system performance and recent activities.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.transactions.pending.count}</div>
            <p className="text-xs text-muted-foreground">Awaiting review or approval</p>
            <Button
              variant="link"
              className="px-0 text-xs text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
              onClick={() => router.push("/admin/transactions?status=PENDING")}
            >
              View all pending
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.transactions.completed.count}</div>
            <p className="text-xs text-muted-foreground">Successfully processed today</p>
            <Button
              variant="link"
              className="px-0 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              onClick={() => router.push("/admin/transactions?status=COMPLETED")}
            >
              View completed
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed (24h)</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.transactions.rejected.count}</div>
            <p className="text-xs text-muted-foreground">Failed in the last 24 hours</p>
            <Button
              variant="link"
              className="px-0 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              onClick={() => router.push("/admin/transactions?status=FAILED")}
            >
              View failed
            </Button>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active on platform</p>
            <Button
              variant="link"
              className="px-0 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => router.push("/admin/users")}
            >
              View all users
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.transactions?.pending?.count + data?.stats.transactions?.completed?.count + data?.stats.transactions?.rejected?.count + data?.stats.transactions?.processing?.count}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card className="w-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats.transactions?.addMoney?.totalAmount + data?.stats.transactions?.transferMoney?.totalAmount}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {data?.recentTransactions.all.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md"
                onClick={() => handleTransactionClick(transaction.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${transaction.transactionType === "WITHDRAWAL" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}
                  >
                    {transaction.transactionType === "DEPOSIT" ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : transaction.transactionType === "WITHDRAWAL" ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{transaction.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.user.firstName} {transaction.user.lastName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {transaction.transactionType === "WITHDRAWAL" ?
                      `- ${formatCurrency(transaction.amount)}` :
                      `+ ${formatCurrency(transaction.amount)}`
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`
                    ${transaction.addMoneyTransaction?.status === "COMPLETED" || transaction.transferMoneyTransaction?.status === "COMPLETED"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : transaction.addMoneyTransaction?.status === "PENDING" || transaction.transferMoneyTransaction?.status === "PENDING"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : transaction.addMoneyTransaction?.status === "PROCESSING" || transaction.transferMoneyTransaction?.status === "PROCESSING"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-red-50 text-red-700 border-red-200"
                    }`
                  }
                >
                  {transaction.addMoneyTransaction?.status || transaction.transferMoneyTransaction?.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => router.push("/admin/transactions")}>
              View All Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
