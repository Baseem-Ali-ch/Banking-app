import type React from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 lg:ml-80">
          <div className="container mx-auto p-4 md:p-6 pb-20 lg:pb-6">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav />
    </div>
  )
}
