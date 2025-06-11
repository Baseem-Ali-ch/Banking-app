import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { transactionsApi } from "@/api/transactions"
import type { Transaction, TransactionStatus, FundRequest, TransferRequest } from "@/types"

interface TransactionDraft {
  fromAccountId: string
  toAccountId: string
  newAccount?: {
    accountNumber?: string
    accountHolderName?: string
    bankName?: string
    routingNumber?: string
  }
  amount: number
  description: string
  category: string
}

interface TransactionFilters {
  status: TransactionStatus | null
  accountId: string | null
  dateRange: {
    from: string | null
    to: string | null
  }
  searchTerm: string | null
}

interface TransactionsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface FundRequestsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface TransactionsState {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  selectedTransaction: Transaction | null
  transactionDraft: TransactionDraft | null
  filters: TransactionFilters
  isLoading: boolean
  error: string | null
  fundRequests: FundRequest[]
  fundRequestsLoading: boolean
  fundRequestsError: string | null
  fundRequestsPagination: FundRequestsPagination
  transferRequests: TransferRequest[]
  transferRequestsLoading: boolean
  transferRequestsError: string | null
  transferRequestsPagination: TransactionsPagination
  currentPage: number
  itemsPerPage: number
  transactionsPagination: TransactionsPagination
  completedTransactions: Transaction[]
  completedTransactionsLoading: boolean
  completedTransactionsError: string | null
  completedTransactionsPagination: TransactionsPagination
  allTransactions: Transaction[]
  allTransactionsLoading: boolean
  allTransactionsError: string | null
  allTransactionsPagination: TransactionsPagination
  pendingTransactions: Transaction[]
  pendingTransactionsLoading: boolean
  pendingTransactionsError: string | null
  pendingTransactionsPagination: TransactionsPagination
  processingTransactions: Transaction[]
  processingTransactionsLoading: boolean
  processingTransactionsError: string | null
  processingTransactionsPagination: TransactionsPagination
  rejectedTransactions: Transaction[]
  rejectedTransactionsLoading: boolean
  rejectedTransactionsError: string | null
  rejectedTransactionsPagination: TransactionsPagination
}

interface TransferRequest {
  id: string
  accountId: string
  amount: number
  description: string
  transactionId: string
  userId: string
  status: string
  createdAt: string
  updatedAt: string
  account: {
    id: string
    accountHolderName: string
    accountNumber: string
    ifscCode: string
  }
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
}

const initialState: TransactionsState = {
  transactions: [],
  filteredTransactions: [],
  selectedTransaction: null,
  transactionDraft: null,
  filters: {
    status: null,
    accountId: null,
    dateRange: {
      from: null,
      to: null,
    },
    searchTerm: null,
  },
  isLoading: false,
  error: null,
  fundRequests: [],
  fundRequestsLoading: false,
  fundRequestsError: null,
  fundRequestsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  transferRequests: [],
  transferRequestsLoading: false,
  transferRequestsError: null,
  transferRequestsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  currentPage: 1,
  itemsPerPage: 10,
  transactionsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  completedTransactions: [],
  completedTransactionsLoading: false,
  completedTransactionsError: null,
  completedTransactionsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  allTransactions: [],
  allTransactionsLoading: false,
  allTransactionsError: null,
  allTransactionsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  pendingTransactions: [],
  pendingTransactionsLoading: false,
  pendingTransactionsError: null,
  pendingTransactionsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  processingTransactions: [],
  processingTransactionsLoading: false,
  processingTransactionsError: null,
  processingTransactionsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  rejectedTransactions: [],
  rejectedTransactionsLoading: false,
  rejectedTransactionsError: null,
  rejectedTransactionsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

// Async thunks
export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) => {
    try {
      const response = await transactionsApi.getTransactions({ page, limit })
      const { data } = response
      return {
        transactions: data.transactions,
        transactionsPagination: {
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }
      }
    } catch (error) {
      throw error
    }
  },
)

export const fetchTransactionDetails = createAsyncThunk(
  "transactions/fetchTransactionDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getTransaction(id)
      return response
    } catch (error) {
      return rejectWithValue("Failed to fetch transaction details")
    }
  },
)

export const initiateTransaction = createAsyncThunk(
  "transactions/initiateTransaction",
  async (transactionData: Partial<Transaction>, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.createTransaction(transactionData)
      return response
    } catch (error) {
      return rejectWithValue("Failed to initiate transaction")
    }
  },
)

export const confirmTransaction = createAsyncThunk(
  "transactions/confirmTransaction",
  async (
    {
      fromAccountId,
      toAccountId,
      newAccount,
      amount,
      description,
      category,
      saveNewAccount,
    }: TransactionDraft & { saveNewAccount?: boolean },
    { rejectWithValue },
  ) => {
    try {
      // If it's a new account and we want to save it, create the account first
      let destinationAccountId = toAccountId
      if (toAccountId === "new" && newAccount && saveNewAccount) {
        // In a real app, we would call an API to create the account
        // For now, we'll just simulate it
        console.log("Saving new account:", newAccount)
        // Simulate a new account ID
        destinationAccountId = `new_${Date.now()}`
      }

      // Create the transaction
      const response = await transactionsApi.createTransaction({
        fromAccountId,
        toAccountId: destinationAccountId,
        amount,
        description,
        category,
      })

      return response
    } catch (error) {
      return rejectWithValue("Failed to confirm transaction")
    }
  },
)

export const retryTransaction = createAsyncThunk(
  "transactions/retryTransaction",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { transactions: TransactionsState }
      const transaction = state.transactions.selectedTransaction

      if (!transaction) {
        return rejectWithValue("Transaction not found")
      }

      // Create a new transaction with the same details
      const response = await transactionsApi.createTransaction({
        fromAccountId: transaction.fromAccountId,
        toAccountId: transaction.toAccountId,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
      })

      return response
    } catch (error) {
      return rejectWithValue("Failed to retry transaction")
    }
  },
)

export const cancelTransaction = createAsyncThunk(
  "transactions/cancelTransaction",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.cancelTransaction(id)
      return response
    } catch (error) {
      return rejectWithValue("Failed to cancel transaction")
    }
  },
)

export const pollTransactionStatus = createAsyncThunk(
  "transactions/pollTransactionStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getTransaction(id)
      return response
    } catch (error) {
      return rejectWithValue("Failed to update transaction status")
    }
  },
)

export const updateTransactionStatus = createAsyncThunk(
  "transactions/updateTransactionStatus",
  async ({ id, status }: { id: string; status: TransactionStatus }, { rejectWithValue }) => {
    try {
      // Call the appropriate API based on the status
      let response
      if (status === "COMPLETED") {
        response = await transactionsApi.approveTransaction(id)
      } else if (status === "REJECTED") {
        response = await transactionsApi.rejectTransaction(id)
      } else if (status === "PENDING") {
        response = await transactionsApi.resetTransaction(id)
      } else {
        return rejectWithValue("Invalid status")
      }
      return response
    } catch (error) {
      return rejectWithValue(`Failed to update transaction status to ${status}`)
    }
  },
)

export const fetchFundRequestTransaction = createAsyncThunk(
  "transactions/fetchFundRequestTransaction",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getAllFundRequestsTransactions({ page, limit })
      const { transactions, pagination } = response.data
      return {
        fundRequests: transactions,
        fundRequestsPagination: pagination
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch transactions")
    }
  },
)

export const updateFundRequestStatusToProcessing = createAsyncThunk(
  "transactions/updateFundRequestStatusToProcessing",
  async ({ id, transactionId }: { id: string; transactionId: string }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.updateStatusToProcessing(id, transactionId)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update fund request status to processing")
    }
  },
)

export const approveFundRequest = createAsyncThunk(
  "transactions/approveFundRequest",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.updateStatusToApprove(id)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to approve fund request")
    }
  },
)

export const rejectFundRequest = createAsyncThunk(
  "transactions/rejectFundRequest",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.updateStatusToReject(id, reason)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to reject fund request")
    }
  },
)

export const fetchTransferRequests = createAsyncThunk(
  "transactions/fetchTransferRequests",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      console.log('fetchTransferRequests - page:', page, 'limit:', limit)
      const response = await transactionsApi.getAllTransferRequestsTransactions({ page, limit })
      const { data } = response
      return {
        transferRequests: data.transactions,
        transferRequestsPagination: {
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch transactions")
    }
  },
)

export const processingTransferRequest = createAsyncThunk(
  "transactions/processingTransferRequest",
  async ({ id, transactionId }: { id: string; transactionId: string }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.updateTransferStatusToProcessing(id, transactionId)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update transfer request status to processing")
    }
  },
)

export const approveTransferRequest = createAsyncThunk(
  "transactions/approveTransferRequest",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.updateTransferStatusToApprove(id)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to approve transfer request")
    }
  },
)

export const rejectTransferRequest = createAsyncThunk(
  "transactions/rejectTransferRequest",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.updateTransferStatusToReject(id, reason)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to reject transfer request")
    }
  },
)


//user side fetch
export const fetchMyFundRequest = createAsyncThunk(
  "transactions/fetchMyFundRequest",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getMyFundRequestsTransactions({ page, limit })
      const { data } = response
      return {
        fundRequests: data.transactions,
        fundRequestsPagination: {
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch transactions")
    }
  },
)

export const fetchMyTransferRequests = createAsyncThunk(
  "transactions/getMyTransferRequests",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getMyTransferRequestsTransactions({ page, limit })
      const { data } = response
      return {
        transferRequests: data.transactions,
        transferRequestsPagination: {
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch transactions")
    }
  },
)

export const fetchMyCompletedTransactions = createAsyncThunk(
  "transactions/fetchMyCompletedTransactions",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getMyCompletedTransactions({ page, limit })
      const { data } = response
      return {
        completedTransactions: data.transactions,
        completedTransactionsPagination: {
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch completed transactions")
    }
  },
)

export const fetchAllTransactions = createAsyncThunk(
  "transactions/fetchAllTransactions",
  async (rejectWithValue: (value: any) => any) => {
    try {
      const response = await transactionsApi.getAllTransactions()
      const { data } = response
      return {
        allTransactions: data.transactions,
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch transactions")
    }
  },
)


export const fetchMyPendingTransaction = createAsyncThunk(
  "transactions/fetchMyPendingTransaction",
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getMyPendingTransactions({ page, limit })
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const fetchMyProcessingTransaction = createAsyncThunk(
  "transactions/fetchMyProcessingTransaction",
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getMyProcessingTransactions({ page, limit })
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const fetchMyCompletedTransaction = createAsyncThunk(
  "transactions/fetchMyCompletedTransaction",
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getMyCompletedTransactions({ page, limit })
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const fetchMyRejectedTransaction = createAsyncThunk(
  "transactions/fetchMyRejectedTransaction",
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getMyRejectedTransactions({ page, limit })
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const fetchAllPendingTransactions = createAsyncThunk(
  "transactions/fetchAllPendingTransactions",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getAllPendingTransactions({ page, limit })
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch pending transactions")
    }
  },
)

export const fetchAllProcessingTransactions = createAsyncThunk(
  "transactions/fetchAllProcessingTransactions",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getAllProcessingTransactions({ page, limit })
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch processing transactions")
    }
  },
)

export const fetchAllCompletedTransactions = createAsyncThunk(
  "transactions/fetchAllCompletedTransactions",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getAllCompletedTransactions({ page, limit })
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch completed transactions")
    }
  },
)

export const fetchAllRejectedTransactions = createAsyncThunk(
  "transactions/fetchAllRejectedTransactions",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await transactionsApi.getAllRejectedTransactions({ page, limit })
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch processing transactions")
    }
  },
)

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactionDraft: (state, action: PayloadAction<TransactionDraft>) => {
      state.transactionDraft = action.payload
    },
    clearTransactionDraft: (state) => {
      state.transactionDraft = null
    },
    setStatusFilter: (state, action: PayloadAction<TransactionStatus | null>) => {
      state.filters.status = action.payload
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    },
    setAccountFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.accountId = action.payload
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    },
    setDateRangeFilter: (state, action: PayloadAction<{ from: string | null; to: string | null }>) => {
      state.filters.dateRange = action.payload
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    },
    setSearchTerm: (state, action: PayloadAction<string | null>) => {
      state.filters.searchTerm = action.payload
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    },
    setTransactionFilters: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    },
    resetTransactionFilters: (state) => {
      state.filters = {
        status: null,
        accountId: null,
        dateRange: {
          from: null,
          to: null,
        },
        searchTerm: null,
      }
      state.filteredTransactions = state.transactions
    },
    clearTransactionsFilter: (state) => {
      state.filters = {
        status: null,
        accountId: null,
        dateRange: {
          from: null,
          to: null,
        },
        searchTerm: null,
      }
      state.filteredTransactions = state.transactions
    },
    addTemporaryTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload)
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    },
  },
  extraReducers: (builder) => {
    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false
        state.transactions = action.payload.transactions
        state.filteredTransactions = applyFilters(action.payload.transactions, state.filters)
        state.transactionsPagination = action.payload.transactionsPagination
        state.currentPage = action.payload.transactionsPagination.page
        state.itemsPerPage = action.payload.transactionsPagination.limit
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false
        state.transactions = []
        state.filteredTransactions = []
      })

    // Fetch transaction details
    builder.addCase(fetchTransactionDetails.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchTransactionDetails.fulfilled, (state, action) => {
      state.isLoading = false
      state.selectedTransaction = action.payload
    })
    builder.addCase(fetchTransactionDetails.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Initiate transaction
    builder.addCase(initiateTransaction.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(initiateTransaction.fulfilled, (state, action) => {
      state.isLoading = false
      state.selectedTransaction = action.payload
    })
    builder.addCase(initiateTransaction.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Confirm transaction
    builder.addCase(confirmTransaction.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(confirmTransaction.fulfilled, (state, action) => {
      state.isLoading = false
      state.selectedTransaction = action.payload
      state.transactions.unshift(action.payload)
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
      state.transactionDraft = null
    })
    builder.addCase(confirmTransaction.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Retry transaction
    builder.addCase(retryTransaction.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(retryTransaction.fulfilled, (state, action) => {
      state.isLoading = false
      state.selectedTransaction = action.payload
      state.transactions.unshift(action.payload)
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    })
    builder.addCase(retryTransaction.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Cancel transaction
    builder.addCase(cancelTransaction.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(cancelTransaction.fulfilled, (state, action) => {
      state.isLoading = false
      // Update the transaction in the list
      const index = state.transactions.findIndex((tx) => tx.id === action.payload.id)
      if (index !== -1) {
        state.transactions[index] = action.payload
      }
      // Update the selected transaction
      if (state.selectedTransaction && state.selectedTransaction.id === action.payload.id) {
        state.selectedTransaction = action.payload
      }
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    })
    builder.addCase(cancelTransaction.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Poll transaction status
    builder.addCase(pollTransactionStatus.fulfilled, (state, action) => {
      // Update the transaction in the list
      const index = state.transactions.findIndex((tx) => tx.id === action.payload.id)
      if (index !== -1) {
        state.transactions[index] = action.payload
      }
      // Update the selected transaction
      if (state.selectedTransaction && state.selectedTransaction.id === action.payload.id) {
        state.selectedTransaction = action.payload
      }
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    })

    // Update transaction status
    builder.addCase(updateTransactionStatus.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updateTransactionStatus.fulfilled, (state, action) => {
      state.isLoading = false
      // Update the transaction in the list
      const index = state.transactions.findIndex((tx) => tx.id === action.payload.id)
      if (index !== -1) {
        state.transactions[index] = action.payload
      }
      // Update the selected transaction
      if (state.selectedTransaction && state.selectedTransaction.id === action.payload.id) {
        state.selectedTransaction = action.payload
      }
      state.filteredTransactions = applyFilters(state.transactions, state.filters)
    })
    builder.addCase(updateTransactionStatus.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Fetch fund request transaction
    builder.addCase(fetchFundRequestTransaction.pending, (state) => {
      state.fundRequestsLoading = true
      state.fundRequestsError = null
    })
    builder.addCase(fetchFundRequestTransaction.fulfilled, (state, action) => {
      state.fundRequestsLoading = false
      state.fundRequests = action.payload.fundRequests
      state.fundRequestsPagination = action.payload.fundRequestsPagination
      state.currentPage = action.payload.fundRequestsPagination.page
      state.itemsPerPage = action.payload.fundRequestsPagination.limit
    })
    builder.addCase(fetchFundRequestTransaction.rejected, (state, action) => {
      state.fundRequestsLoading = false
      state.fundRequestsError = action.payload as string
      state.filteredTransactions = []
    })

    // Update fund request status to processing
    builder.addCase(updateFundRequestStatusToProcessing.pending, (state) => {
      state.fundRequestsLoading = true
      state.fundRequestsError = null
    })
    builder.addCase(updateFundRequestStatusToProcessing.fulfilled, (state, action) => {
      state.fundRequestsLoading = false

      // Find and update the specific fund request
      const index = state.fundRequests.findIndex(req => req.id === action.payload.data.id)
      if (index !== -1) {
        state.fundRequests[index] = action.payload.data
      }

      // Optionally refresh the entire list
      // state.fundRequests = [...state.fundRequests]
    })
    builder.addCase(updateFundRequestStatusToProcessing.rejected, (state, action) => {
      state.fundRequestsLoading = false
      state.fundRequestsError = action.payload as string
    })

    // Approve fund request
    builder.addCase(approveFundRequest.pending, (state) => {
      state.fundRequestsLoading = true
      state.fundRequestsError = null
    })
    builder.addCase(approveFundRequest.fulfilled, (state, action) => {
      state.fundRequestsLoading = false

      // Find and update the specific fund request
      const index = state.fundRequests.findIndex(req => req.id === action.payload.data.id)
      if (index !== -1) {
        state.fundRequests[index] = action.payload.data
      }

      // Optionally refresh the entire list
      // state.fundRequests = [...state.fundRequests]
    })
    builder.addCase(approveFundRequest.rejected, (state, action) => {
      state.fundRequestsLoading = false
      state.fundRequestsError = action.payload as string
    })

    // Reject fund request
    builder.addCase(rejectFundRequest.pending, (state) => {
      state.fundRequestsLoading = true
      state.fundRequestsError = null
    })
    builder.addCase(rejectFundRequest.fulfilled, (state, action) => {
      state.fundRequestsLoading = false

      // Find and update the specific fund request
      const index = state.fundRequests.findIndex(req => req.id === action.payload.data.id)
      if (index !== -1) {
        state.fundRequests[index] = action.payload.data
      }
    })
    builder.addCase(rejectFundRequest.rejected, (state, action) => {
      state.fundRequestsLoading = false
      state.fundRequestsError = action.payload as string
    })

    // Fetch transfer requests
    builder.addCase(fetchTransferRequests.pending, (state) => {
      state.transferRequestsLoading = true
      state.transferRequestsError = null
    })
    builder.addCase(fetchTransferRequests.fulfilled, (state, action) => {
      state.transferRequestsLoading = false
      state.transferRequests = action.payload.transferRequests
      state.transferRequestsPagination = action.payload.transferRequestsPagination
      state.currentPage = action.payload.transferRequestsPagination.page
      state.itemsPerPage = action.payload.transferRequestsPagination.limit
    })

    builder.addCase(fetchTransferRequests.rejected, (state, action) => {
      state.transferRequestsLoading = false
      state.transferRequestsError = action.payload as string
    })

    // Update transfer request status to processing
    builder.addCase(processingTransferRequest.pending, (state) => {
      state.transferRequestsLoading = true
      state.transferRequestsError = null
    })
    builder.addCase(processingTransferRequest.fulfilled, (state, action) => {
      state.transferRequestsLoading = false

      // Find and update the specific transfer request
      const index = state.transferRequests.findIndex(req => req.id === action.payload.data.id)
      if (index !== -1) {
        state.transferRequests[index] = action.payload.data
      }
    })
    builder.addCase(processingTransferRequest.rejected, (state, action) => {
      state.transferRequestsLoading = false
      state.transferRequestsError = action.payload as string
    })

    // Approve transfer request
    builder.addCase(approveTransferRequest.pending, (state) => {
      state.transferRequestsLoading = true
      state.transferRequestsError = null
    })
    builder.addCase(approveTransferRequest.fulfilled, (state, action) => {
      state.transferRequestsLoading = false

      // Find and update the specific transfer request
      const index = state.transferRequests.findIndex(req => req.id === action.payload.data.id)
      if (index !== -1) {
        state.transferRequests[index] = action.payload.data
      }
    })
    builder.addCase(approveTransferRequest.rejected, (state, action) => {
      state.transferRequestsLoading = false
      state.transferRequestsError = action.payload as string
    })

    // Reject transfer request
    builder.addCase(rejectTransferRequest.pending, (state) => {
      state.transferRequestsLoading = true
      state.transferRequestsError = null
    })
    builder.addCase(rejectTransferRequest.fulfilled, (state, action) => {
      state.transferRequestsLoading = false

      // Find and update the specific transfer request
      const index = state.transferRequests.findIndex(req => req.id === action.payload.data.id)
      if (index !== -1) {
        state.transferRequests[index] = action.payload.data
      }
    })
    builder.addCase(rejectTransferRequest.rejected, (state, action) => {
      state.transferRequestsLoading = false
      state.transferRequestsError = action.payload as string
    })

    // Fetch transfer requests
    builder.addCase(fetchMyFundRequest.pending, (state) => {
      state.transferRequestsLoading = true
      state.transferRequestsError = null
    })
    builder.addCase(fetchMyFundRequest.fulfilled, (state, action) => {
      state.transferRequestsLoading = false
      state.fundRequests = action.payload.fundRequests
      state.fundRequestsPagination = action.payload.fundRequestsPagination
      state.currentPage = action.payload.fundRequestsPagination.page
      state.itemsPerPage = action.payload.fundRequestsPagination.limit
    })

    builder.addCase(fetchMyFundRequest.rejected, (state, action) => {
      state.transferRequestsLoading = false
      state.transferRequestsError = action.payload as string
    })

    // Fetch transfer requests
    builder.addCase(fetchMyTransferRequests.pending, (state) => {
      state.transferRequestsLoading = true
      state.transferRequestsError = null
    })
    builder.addCase(fetchMyTransferRequests.fulfilled, (state, action) => {
      state.transferRequestsLoading = false
      state.transferRequests = action.payload.transferRequests
      state.transferRequestsPagination = action.payload.transferRequestsPagination
      state.currentPage = action.payload.transferRequestsPagination.page
      state.itemsPerPage = action.payload.transferRequestsPagination.limit
    })

    builder.addCase(fetchMyTransferRequests.rejected, (state, action) => {
      state.transferRequestsLoading = false
      state.transferRequestsError = action.payload as string
    })

    // Fetch completed transactions
    builder.addCase(fetchMyCompletedTransactions.pending, (state) => {
      state.completedTransactionsLoading = true
      state.completedTransactionsError = null
    })
    builder.addCase(fetchMyCompletedTransactions.fulfilled, (state, action) => {
      state.completedTransactionsLoading = false
      state.completedTransactions = action.payload.completedTransactions
      state.completedTransactionsPagination = action.payload.completedTransactionsPagination
      state.currentPage = action.payload.completedTransactionsPagination.page
      state.itemsPerPage = action.payload.completedTransactionsPagination.limit
    })
    builder.addCase(fetchMyCompletedTransactions.rejected, (state, action) => {
      state.completedTransactionsLoading = false
      state.completedTransactionsError = action.payload as string
    })

    // Fetch all transactions
    builder.addCase(fetchAllTransactions.pending, (state) => {
      state.allTransactionsLoading = true
      state.allTransactionsError = null
    })
    builder.addCase(fetchAllTransactions.fulfilled, (state, action) => {
      state.allTransactionsLoading = false
      state.allTransactions = action.payload.allTransactions
    })
    builder.addCase(fetchAllTransactions.rejected, (state, action) => {
      state.allTransactionsLoading = false
      state.allTransactionsError = action.payload as string
    })

    builder.addCase(fetchMyPendingTransaction.pending, (state) => {
      state.pendingTransactionsLoading = true
      state.pendingTransactionsError = null
    })
    builder.addCase(fetchMyPendingTransaction.fulfilled, (state, action) => {
      state.pendingTransactionsLoading = false
      state.pendingTransactions = action.payload.data.transactions
      state.pendingTransactionsPagination = {
        page: action.payload.data.pagination.page,
        limit: action.payload.data.pagination.limit,
        total: action.payload.data.pagination.total,
        totalPages: action.payload.data.pagination.totalPages,
      }
    })
    builder.addCase(fetchMyPendingTransaction.rejected, (state, action) => {
      state.pendingTransactionsLoading = false
      state.pendingTransactionsError = action.error.message || "Failed to fetch transactions"
    })

    builder.addCase(fetchMyProcessingTransaction.pending, (state) => {
      state.processingTransactionsLoading = true
      state.processingTransactionsError = null
    })
    builder.addCase(fetchMyProcessingTransaction.fulfilled, (state, action) => {
      state.processingTransactionsLoading = false
      state.processingTransactions = action.payload.data.transactions
      state.processingTransactionsPagination = {
        page: action.payload.data.pagination.page,
        limit: action.payload.data.pagination.limit,
        total: action.payload.data.pagination.total,
        totalPages: action.payload.data.pagination.totalPages,
      }
    })
    builder.addCase(fetchMyProcessingTransaction.rejected, (state, action) => {
      state.processingTransactionsLoading = false
      state.processingTransactionsError = action.error.message || "Failed to fetch transactions"
    })

    builder.addCase(fetchMyRejectedTransaction.pending, (state) => {
      state.rejectedTransactionsLoading = true
      state.rejectedTransactionsError = null
    })
    builder.addCase(fetchMyRejectedTransaction.fulfilled, (state, action) => {
      state.rejectedTransactionsLoading = false
      state.rejectedTransactions = action.payload.data.transactions
      state.rejectedTransactionsPagination = {
        page: action.payload.data.pagination.page,
        limit: action.payload.data.pagination.limit,
        total: action.payload.data.pagination.total,
        totalPages: action.payload.data.pagination.totalPages,
      }
    })
    builder.addCase(fetchMyRejectedTransaction.rejected, (state, action) => {
      state.rejectedTransactionsLoading = false
      state.rejectedTransactionsError = action.error.message || "Failed to fetch rejected transactions"
    })

    builder.addCase(fetchAllPendingTransactions.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchAllPendingTransactions.fulfilled, (state, action) => {
      state.isLoading = false
      state.error = null
      state.pendingTransactions = action.payload.data.transactions
      state.pendingTransactionsPagination = {
        page: action.payload.data.pagination.page,
        limit: action.payload.data.pagination.limit,
        total: action.payload.data.pagination.total,
        totalPages: action.payload.data.pagination.totalPages,
      }
    })
    builder.addCase(fetchAllPendingTransactions.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    builder.addCase(fetchAllProcessingTransactions.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchAllProcessingTransactions.fulfilled, (state, action) => {
      state.isLoading = false
      state.error = null
      state.processingTransactions = action.payload.data.transactions
      state.processingTransactionsPagination = {
        page: action.payload.data.pagination.page,
        limit: action.payload.data.pagination.limit,
        total: action.payload.data.pagination.total,
        totalPages: action.payload.data.pagination.totalPages,
      }
    })
    builder.addCase(fetchAllProcessingTransactions.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    builder.addCase(fetchAllCompletedTransactions.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchAllCompletedTransactions.fulfilled, (state, action) => {
      state.isLoading = false
      state.error = null
      state.completedTransactions = action.payload.data.transactions
      state.completedTransactionsPagination = {
        page: action.payload.data.pagination.page,
        limit: action.payload.data.pagination.limit,
        total: action.payload.data.pagination.total,
        totalPages: action.payload.data.pagination.totalPages,
      }
    })
    builder.addCase(fetchAllCompletedTransactions.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    builder.addCase(fetchAllRejectedTransactions.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchAllRejectedTransactions.fulfilled, (state, action) => {
      state.isLoading = false
      state.error = null
      state.rejectedTransactions = action.payload.data.transactions
      state.rejectedTransactionsPagination = {
        page: action.payload.data.pagination.page,
        limit: action.payload.data.pagination.limit,
        total: action.payload.data.pagination.total,
        totalPages: action.payload.data.pagination.totalPages,
      }
    })
    builder.addCase(fetchAllRejectedTransactions.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  },
})

// Helper function to apply filters
const applyFilters = (transactions: Transaction[], filters: TransactionFilters) => {
  return transactions.filter((tx) => {
    // Status filter
    if (filters.status && tx.status !== filters.status) {
      return false
    }

    // Account filter
    if (filters.accountId && tx.fromAccountId !== filters.accountId && tx.toAccountId !== filters.accountId) {
      return false
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const txDate = new Date(tx.date).getTime()

      if (filters.dateRange.from) {
        const fromDate = new Date(filters.dateRange.from).getTime()
        if (txDate < fromDate) {
          return false
        }
      }

      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to).getTime()
        if (txDate > toDate) {
          return false
        }
      }
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      const matchesId = tx.id.toLowerCase().includes(searchTerm)
      const matchesDescription = tx.description.toLowerCase().includes(searchTerm)
      const matchesCategory = tx.category.toLowerCase().includes(searchTerm)

      if (!matchesId && !matchesDescription && !matchesCategory) {
        return false
      }
    }

    return true
  })
}

export const {
  setTransactionDraft,
  clearTransactionDraft,
  setStatusFilter,
  setAccountFilter,
  setDateRangeFilter,
  setSearchTerm,
  setTransactionFilters,
  resetTransactionFilters,
  clearTransactionsFilter,
  addTemporaryTransaction,
} = transactionsSlice.actions

export const selectTransferRequests = (state: RootState) => state.transactions.transferRequests
export const selectTransferRequestsLoading = (state: RootState) => state.transactions.transferRequestsLoading
export const selectTransferRequestsError = (state: RootState) => state.transactions.transferRequestsError
export const selectTransferRequestsPagination = (state: RootState) => state.transactions.transferRequestsPagination
export const selectCompletedTransactions = (state: RootState) => state.transactions.completedTransactions
export const selectCompletedTransactionsLoading = (state: RootState) => state.transactions.isLoading
export const selectCompletedTransactionsError = (state: RootState) => state.transactions.error
export const selectCompletedTransactionsPagination = (state: RootState) => state.transactions.completedTransactionsPagination
export const selectAllTransactions = (state: RootState) => state.transactions.allTransactions
export const selectAllTransactionsLoading = (state: RootState) => state.transactions.allTransactionsLoading
export const selectAllTransactionsError = (state: RootState) => state.transactions.allTransactionsError
export const selectAllTransactionsPagination = (state: RootState) => state.transactions.allTransactionsPagination

export const selectPendingTransactions = (state: RootState) => state.transactions.pendingTransactions
export const selectPendingTransactionsLoading = (state: RootState) => state.transactions.pendingTransactionsLoading
export const selectPendingTransactionsError = (state: RootState) => state.transactions.pendingTransactionsError
export const selectPendingTransactionsPagination = (state: RootState) => state.transactions.pendingTransactionsPagination

export const selectProcessingTransactions = (state: RootState) => state.transactions.processingTransactions
export const selectProcessingTransactionsLoading = (state: RootState) => state.transactions.processingTransactionsLoading
export const selectProcessingTransactionsError = (state: RootState) => state.transactions.processingTransactionsError
export const selectProcessingTransactionsPagination = (state: RootState) => state.transactions.processingTransactionsPagination

export const selectRejectedTransactions = (state: RootState) => state.transactions.rejectedTransactions
export const selectRejectedTransactionsLoading = (state: RootState) => state.transactions.rejectedTransactionsLoading
export const selectRejectedTransactionsError = (state: RootState) => state.transactions.rejectedTransactionsError
export const selectRejectedTransactionsPagination = (state: RootState) => state.transactions.rejectedTransactionsPagination

export default transactionsSlice.reducer
