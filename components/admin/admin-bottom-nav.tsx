"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, BarChart3, Users, FileText, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Home",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: BarChart3,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
]

export function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Bottom Navigation for Mobile and Tablet */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/admin/dashboard" && pathname === "/admin") ||
              (item.href === "/admin/transactions" && pathname.startsWith("/admin/transactions")) ||
              (item.href === "/admin/users" && pathname.startsWith("/admin/users")) ||
              (item.href === "/admin/reports" && pathname.startsWith("/admin/reports")) ||
              (item.href === "/admin/fund-requests" &&
                (pathname.startsWith("/admin/fund-requests") ||
                  pathname.startsWith("/admin/transfer-requests") ||
                  pathname.startsWith("/admin/pending-transactions") ||
                  pathname.startsWith("/admin/processing-transactions") ||
                  pathname.startsWith("/admin/completed-transactions") ||
                  pathname.startsWith("/admin/rejected-transactions") ||
                  pathname.startsWith("/admin/pending-portal-access")))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 px-2 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                <span className="text-xs font-medium truncate w-full text-center leading-tight">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Spacer for bottom navigation on mobile */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
