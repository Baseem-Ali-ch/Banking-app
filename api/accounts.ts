import type { AccountsResponse, BankAccount, Transaction } from "@/types"
import { api } from "./client"

export const accountsApi = {
  getAccounts: async (): Promise<AccountsResponse> => {
    return await api.get("/accounts")
  },

  getAccount: async (id: string): Promise<AccountsResponse> => {
    return await api.get(`/accounts/${id}`)
  },

  addAccount: async (accountData: Partial<BankAccount>): Promise<AccountsResponse> => {
    return await api.post("/accounts", accountData)
  },

  updateAccount: async (id: string, accountData: Partial<BankAccount>): Promise<AccountsResponse> => {
    return await api.put(`/accounts/${id}`, accountData)
  },

  deleteAccount: async (id: string): Promise<{ status: string, message: string }> => {
    return await api.delete(`/accounts/${id}`)
  },

  setDefaultAccount: async (id: string): Promise<BankAccount> => {
    await delay(800)

    const accountIndex = mockAccounts.findIndex((acc) => acc.id === id)
    if (accountIndex === -1) {
      throw new Error("Account not found")
    }

    // Set all accounts to non-default
    mockAccounts.forEach((acc) => {
      acc.isDefault = false
    })

    // Set the specified account as default
    mockAccounts[accountIndex].isDefault = true

    return { ...mockAccounts[accountIndex] }
  },

  getAccountBalance: async (id: string): Promise<{ balance: number }> => {
    await delay(500)

    const account = mockAccounts.find((acc) => acc.id === id)
    if (!account) {
      throw new Error("Account not found")
    }

    return { balance: account.balance }
  },

  getAccountTransactions: async (id: string): Promise<Transaction[]> => {
    await delay(1000)

    // Check if account exists
    const account = mockAccounts.find((acc) => acc.id === id)
    if (!account) {
      throw new Error("Account not found")
    }

    // Return transactions for this account
    return mockTransactions[id] || []
  },
}
