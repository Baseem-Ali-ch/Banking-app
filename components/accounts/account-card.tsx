"use client"

import { cn } from "@/lib/utils"
import type { BankAccount } from "@/types"

interface AccountCardProps {
  account: BankAccount
  onClick?: () => void
}

export function AccountCard({ account, onClick }: AccountCardProps) {
  const formatAccountNumber = (accountNumber: string) => {
    // Mask middle 6 digits
    const first4 = accountNumber.slice(0, 4)
    const last4 = accountNumber.slice(-4)
    const middle = '••• •••'
    return `${first4} ${middle} ${last4}`
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
    })
  }

  // Generate a gradient based on the bank name for visual variety
  const getCardGradient = (bankName: string) => {
    const gradients = [
      "bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700",
      "bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700",
      "bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700",
      "bg-gradient-to-br from-rose-600 via-rose-500 to-rose-700",
      "bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700",
      "bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700",
      "bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700",
      "bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700",
    ]

    // Use a hash of the bank name to select a consistent gradient
    const hash = bankName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return gradients[hash % gradients.length]
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] h-48",
        getCardGradient(account.accountHolderName),
        onClick && "cursor-pointer",
      )}
      onClick={onClick}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      <div className="relative p-6 h-full flex flex-col justify-between text-white">
        {/* Header with bank name and default badge */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
          </div>
          {/* {account.isDefault && (
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold border border-white/30">
              Default
            </div>
          )} */}
        </div>

        {/* Card chip - more realistic design */}
        <div className="absolute top-6 right-6">
          <div className="relative w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-lg shadow-lg">
            <div className="absolute inset-1 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-md">
              <div className="w-full h-full grid grid-cols-3 gap-px p-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-yellow-400/60 rounded-sm"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account number */}
        <div className="mt-4">
          <h3 className="font-bold text-lg mb-2">{formatAccountNumber(account.accountNumber)}</h3>
          <p className="text-xs opacity-90">Account Holder</p>
          <p className="text-md opacity-90 mb-2 font-bold">{account.accountHolderName}</p>

          <div className="flex gap-6">
            <div>
              <p className="text-xs opacity-90">IFSC Code</p>
              <p className="text-md opacity-90 mb-2 font-bold">{account.ifscCode}</p>
            </div>

            <div >
              <p className="text-xs opacity-90">Created</p>
              <p className="text-md opacity-90 mb-2 font-bold">{formatDate(account.createdAt)}</p>

            </div>
          </div>

        </div>

        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
      </div>
    </div>
  )
}
