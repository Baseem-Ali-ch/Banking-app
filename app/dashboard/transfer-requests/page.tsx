import { TransferRequestsTable } from "@/components/transactions/transfer-requests-table"

export default function TransferRequestsPage() {
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Transfer Requests</h1>
      </div>
      <TransferRequestsTable />
    </div>
  )
}
