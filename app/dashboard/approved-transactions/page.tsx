import { ApprovedTransactionsTable } from "@/components/transactions/approved-transactions-table"

export default function ApprovedTransactionsPage() {
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Approved Transactions</h1>
      </div>
      <ApprovedTransactionsTable />
    </div>
  )
}
