import { RejectedTransactionsTable } from "@/components/transactions/rejected-transactions-table"

export default function RejectedTransactionsPage() {
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Rejected Transactions</h1>
      </div>
      <RejectedTransactionsTable />
    </div>
  )
}
