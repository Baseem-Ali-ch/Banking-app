"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, CreditCard, BarChart2, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      name: "Accounts",
      href: "/dashboard/accounts",
      icon: CreditCard,
      active: pathname.startsWith("/dashboard/accounts"),
    },
    {
      name: "Transactions",
      href: "/dashboard/transactions",
      icon: BarChart2,
      active: pathname.startsWith("/dashboard/transactions"),
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              item.active ? "text-primary" : "text-muted-foreground",
            )}
            onClick={() => router.push(item.href)}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
