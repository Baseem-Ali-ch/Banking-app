import { FundRequestsTable } from "@/components/transactions/fund-requests-table"

export default function FundRequestsPage() {
  return (
    <div className="container px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Fund Requests</h1>
      </div>
      <FundRequestsTable />
    </div>
  )
}
