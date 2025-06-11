"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportsSkeleton } from "./reports/reports-skeleton"

export function ReportsAnalyticsContent() {
  const dispatch = useAppDispatch()
  const { dateRange } = useAppSelector((state) => state.reports)
  const kpiLoading = useAppSelector((state) => state.reports.kpi.loading)
  const transactionVolumeLoading = useAppSelector((state) => state.reports.transactionVolume.loading)
  const userGrowthLoading = useAppSelector((state) => state.reports.userGrowth.loading)
  const transactionPatternsLoading = useAppSelector((state) => state.reports.transactionPatterns.loading)

  const isLoading = kpiLoading || transactionVolumeLoading || userGrowthLoading || transactionPatternsLoading

  useEffect(() => {
    // No data fetching needed since this is a coming soon page
  }, [dispatch, dateRange])

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    // No-op since this is a coming soon page
  }

  if (isLoading) {
    return <ReportsSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into system performance and transaction patterns coming soon!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DatePickerWithRange
            date={{
              from: new Date(dateRange.startDate),
              to: new Date(dateRange.endDate),
            }}
            setDate={(range) => {
              if (range?.from && range?.to) {
                handleDateRangeChange({ from: range.from, to: range.to })
              }
            }}
          />
          <span className="text-sm text-muted-foreground">(Coming Soon)</span>
        </div>
      </div>

      <div className="rounded-lg border p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Feature Coming Soon</h2>
        <p className="text-muted-foreground mb-4">
          We're working on building comprehensive reports and analytics features. Stay tuned for updates!
        </p>
        <div className="flex justify-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">Transaction Volume</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">User Growth</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">Transaction Patterns</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">System Performance</span>
          </div>
        </div>
      </div>
    </div>
  )
}
