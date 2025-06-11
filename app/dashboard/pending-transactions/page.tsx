import { PendingTransactionsTable } from "@/components/transactions/pending-transactions-table"

export default function PendingTransactionsPage() {
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pending Transactions</h1>
      </div>
      <PendingTransactionsTable />
    </div>
  )
}
