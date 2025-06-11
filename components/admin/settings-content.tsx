"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { logoutAsync } from "@/store/slices/authSlice"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "sonner"
import Cookies from "js-cookie"

export function SettingsContent() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutAsync()).unwrap()

      if (result.status === 'success') {
        const token = Cookies.remove("auth_token")
        const role = Cookies.remove("auth_role")
      }

      toast.success("Logged out successfully", {
        description: result.message || "You have been logged out of your account.",
        duration: 1500,
        position: 'top-right'
      })
      router.push("/auth/login")
    } catch (error: Error | any) {
      toast.error("Failed", {
        description: error.message || "Failed to log out. Please try again.",
        duration: 1500,
        position: 'top-right'
      })
    }
  }

  return (
    <div className="container px-4 py-6 pb-20 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure system behavior, workflows, and security parameters (Coming Soon)</p>
        </div>
        <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="rounded-lg border p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Feature Coming Soon</h2>
        <p className="text-muted-foreground mb-8">
          We're working on building comprehensive settings features. Stay tuned for updates!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Roles & Permissions</h3>
            <p className="text-muted-foreground text-sm">Configure user roles and their associated permissions</p>
          </div>
          <div className="flex flex-col items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Transaction Workflows</h3>
            <p className="text-muted-foreground text-sm">Configure approval workflows for different transaction types</p>
          </div>
          <div className="flex flex-col items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Audit Trail</h3>
            <p className="text-muted-foreground text-sm">Configure audit logging and retention policies</p>
          </div>
        </div>
      </div>
    </div>
  )
}
