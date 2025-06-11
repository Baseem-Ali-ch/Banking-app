"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  CreditCard,
  BarChart2,
  User,
  Menu,
  X,
  PlusCircle,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export function UserSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    {
      name: "Fund Requests",
      href: "/dashboard/fund-requests",
      icon: PlusCircle,
      active: pathname === "/dashboard/fund-requests",
    },
    {
      name: "Transfer Requests",
      href: "/dashboard/transfer-requests",
      icon: ArrowRightLeft,
      active: pathname === "/dashboard/transfer-requests",
    },
    {
      name: "Pending Transactions",
      href: "/dashboard/pending-transactions",
      icon: Clock,
      active: pathname === "/dashboard/pending-transactions",
    },
    {
      name: "Processing Transactions",
      href: "/dashboard/processing-transactions",
      icon: BarChart2,
      active: pathname === "/dashboard/processing-transactions",
    },
    {
      name: "Approved Transactions",
      href: "/dashboard/approved-transactions",
      icon: CheckCircle,
      active: pathname === "/dashboard/approved-transactions",
    },
    {
      name: "Rejected Transactions",
      href: "/dashboard/rejected-transactions",
      icon: XCircle,
      active: pathname === "/dashboard/rejected-transactions",
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
      active: pathname.startsWith("/dashboard/profile"),
    },
  ]

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-20 flex h-16 items-center justify-between border-b bg-background px-4 md:hidden">
        <div className="flex items-center">
          <Logo />
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div
        className={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden", isOpen ? "block" : "hidden")}
        onClick={toggleSidebar}
      />

      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 border-r bg-background transition-transform md:translate-x-0 md:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Logo />
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 md:hidden" onClick={toggleSidebar}>
            <X className="h-6 w-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
        <div className="py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  item.active ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
