import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Wallet, WalletTransaction } from "@/types"
import { fetchWalletDetails, addWalletBalance, sendWalletBalance, fetchWalletTransactions, fetchBalance } from "@/api/wallet"

interface WalletState {
  wallet: Wallet | null
  transactions: WalletTransaction[]
  pendingTransactions: WalletTransaction[]
  isLoading: boolean
  error: string | null
  transactionsLoading: boolean
  transactionsError: string | null
  notifications: WalletNotification[]
  hasUnreadNotifications: boolean
}

export interface WalletNotification {
  id: string
  transactionId: string
  message: string
  status: "unread" | "read"
  createdAt: string
  type: "success" | "error" | "info"
}

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  pendingTransactions: [],
  isLoading: false,
  error: null,
  transactionsLoading: false,
  transactionsError: null,
  notifications: [],
  hasUnreadNotifications: false,
}

// Async thunks
export const getWalletDetails = createAsyncThunk("wallet/getWalletDetails", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchWalletDetails()
    return response
  } catch (error: any) {
    return rejectWithValue(error.response.data)
  }
})

export const getWalletTransactions = createAsyncThunk(
  "wallet/getWalletTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWalletTransactions()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
)

export const depositToWallet = createAsyncThunk(
  "wallet/depositToWallet",
  async ({ amount, location, description }: { amount: number; location: string; description: string }, { rejectWithValue }) => {
    try {
      const response = await addWalletBalance(amount, location, description)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
)

export const sendFromWallet = createAsyncThunk(
  "wallet/sendFromWallet",
  async (
    { amount, accountId, description }: { amount: number; accountId: string; description: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await sendWalletBalance(amount, accountId, description)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
)

export const fetchWalletBalance = createAsyncThunk(
  "wallet/fetchWalletBalance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchBalance()
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
)

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    addPendingTransaction: (state, action: PayloadAction<WalletTransaction>) => {
      state.pendingTransactions.unshift(action.payload)
    },
    clearPendingTransactions: (state) => {
      state.pendingTransactions = []
    },
    updateWalletBalance: (state, action: PayloadAction<number>) => {
      if (state.wallet) {
        state.wallet.balance = action.payload
      }
    },
    addNotification: (state, action: PayloadAction<WalletNotification>) => {
      state.notifications.unshift(action.payload)
      state.hasUnreadNotifications = true
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload)
      if (notification) {
        notification.status = "read"
      }
      state.hasUnreadNotifications = state.notifications.some((n) => n.status === "unread")
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.status = "read"
      })
      state.hasUnreadNotifications = false
    },
    updateTransactionStatus: (
      state,
      action: PayloadAction<{
        transactionId: string
        status: "PENDING" | "COMPLETED" | "REJECTED"
        adminNote?: string
      }>,
    ) => {
      const { transactionId, status, adminNote } = action.payload
      const transaction = state.transactions.find((t) => t.id === transactionId)
      if (transaction) {
        transaction.status = status
        transaction.updatedAt = new Date().toISOString()
        if (adminNote) {
          transaction.adminNote = adminNote
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get wallet details
      .addCase(getWalletDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getWalletDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.wallet = action.payload.data.wallet
      })
      .addCase(getWalletDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Get wallet transactions
      .addCase(getWalletTransactions.pending, (state) => {
        state.transactionsLoading = true
        state.transactionsError = null
      })
      .addCase(getWalletTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false
        const data = action.payload?.data || {}
        state.transactions = data.transactions || []
      })
      .addCase(getWalletTransactions.rejected, (state, action) => {
        state.transactionsLoading = false
        state.transactionsError = action.payload as string
      })
      // Deposit to wallet
      .addCase(depositToWallet.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(depositToWallet.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.wallet) {
          state.wallet.balance = action.payload.data.newBalance
        }
        state.transactions.unshift(action.payload.data.transaction)
        state.pendingTransactions = state.pendingTransactions.filter((tx) => tx.id !== action.payload.data.transaction.id)
      })
      .addCase(depositToWallet.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Send from wallet
      .addCase(sendFromWallet.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendFromWallet.fulfilled, (state, action) => {
        state.isLoading = false
        // Don't update balance yet since the transaction is pending
        state.transactions.unshift(action.payload.data.transaction)
        state.pendingTransactions = state.pendingTransactions.filter((tx) => tx.id !== action.payload.data.transaction.id)
      })
      .addCase(sendFromWallet.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  addPendingTransaction,
  clearPendingTransactions,
  updateWalletBalance,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateTransactionStatus,
} = walletSlice.actions

export default walletSlice.reducer
