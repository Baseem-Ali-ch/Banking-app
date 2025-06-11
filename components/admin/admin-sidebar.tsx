"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  CreditCard,
  ArrowUpDown,
  Clock,
  Loader,
  CheckCircle,
  XCircle,
  UserCheck,
  Settings,
  Menu,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const sidebarLinks = [
  {
    title: "Fund Requests",
    href: "/admin/fund-requests",
    icon: CreditCard,
  },
  {
    title: "Transfer Requests",
    href: "/admin/transfer-requests",
    icon: ArrowUpDown,
  },
  {
    title: "Pending Transactions",
    href: "/admin/pending-transactions",
    icon: Clock,
  },
  {
    title: "Processing Transactions",
    href: "/admin/processing-transactions",
    icon: Loader,
  },
  {
    title: "Completed Transactions",
    href: "/admin/completed-transactions",
    icon: CheckCircle,
  },
  {
    title: "Rejected Transactions",
    href: "/admin/rejected-transactions",
    icon: XCircle,
  },
  {
    title: "Pending Portal Access",
    href: "/admin/pending-portal-access",
    icon: UserCheck,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span>Admin Portal</span>
        </Link>
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <nav className="flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Button
                key={link.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("justify-start", isActive && "bg-secondary font-medium")}
                asChild
              >
                <Link href={link.href}>
                  <link.icon className="mr-2 h-5 w-5" />
                  {link.title}
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r bg-background shadow-sm md:flex">
        <SidebarContent />
      </aside>
    </>
  )
}
