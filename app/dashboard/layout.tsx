import type React from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { UserSidebar } from "@/components/navigation/user-sidebar"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen">
      <UserSidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <BottomNav />
      </div>
    </div>
  )
}
