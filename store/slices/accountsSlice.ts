import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { accountsApi } from "@/api/accounts"
import type { BankAccount, Transaction } from "@/types"

interface AccountsState {
  accounts: BankAccount[]
  selectedAccount: BankAccount | null
  selectedAccountTransactions: Transaction[]
  pagination: any
  isLoading: boolean
  error: string | null
}

const initialState: AccountsState = {
  accounts: [],
  selectedAccount: null,
  selectedAccountTransactions: [],
  pagination: {},
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountsApi.getAccounts()
      console.log('account resonse', response)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchAccount = createAsyncThunk("accounts/fetchAccount", async (id: string, { rejectWithValue }) => {
  try {
    const response = await accountsApi.getAccount(id)
    return response
  } catch (error: any) {
    return rejectWithValue(error.response.data)
  }
})

export const fetchAccountTransactions = createAsyncThunk(
  "accounts/fetchAccountTransactions",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await accountsApi.getAccountTransactions(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
)

export const addAccount = createAsyncThunk(
  "accounts/addAccount",
  async (accountData: Partial<BankAccount>, { rejectWithValue }) => {
    try {
      const response = await accountsApi.addAccount(accountData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const updateAccount = createAsyncThunk(
  "accounts/updateAccount",
  async ({ id, data }: { id: string; data: Partial<BankAccount> }, { rejectWithValue }) => {
    try {
      const response = await accountsApi.updateAccount(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
)

export const deleteAccount = createAsyncThunk(
  "accounts/deleteAccount",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await accountsApi.deleteAccount(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const setDefaultAccount = createAsyncThunk(
  "accounts/setDefaultAccount",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await accountsApi.setDefaultAccount(id)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
)

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<BankAccount[]>) => {
      state.accounts = action.payload
    },
    selectAccount: (state, action: PayloadAction<BankAccount>) => {
      state.selectedAccount = action.payload
    },
    clearSelectedAccount: (state) => {
      state.selectedAccount = null
    },
    clearAccountsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch accounts
    builder.addCase(fetchAccounts.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchAccounts.fulfilled, (state, action) => {
      state.isLoading = false
      state.accounts = action.payload.data.accounts
      state.pagination = action.payload.data.pagination
    })
    builder.addCase(fetchAccounts.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload?.message || "Failed to fetch accounts"
    })

    // Fetch single account
    builder.addCase(fetchAccount.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(fetchAccount.fulfilled, (state, action) => {
      state.isLoading = false
      state.selectedAccount = action.payload.data.account
    })
    builder.addCase(fetchAccount.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload?.message || "Failed to fetch account details"
    })

    // Fetch account transactions
    builder.addCase(fetchAccountTransactions.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(fetchAccountTransactions.fulfilled, (state, action) => {
      state.isLoading = false
      state.selectedAccountTransactions = action.payload
    })
    builder.addCase(fetchAccountTransactions.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload?.message || "Failed to fetch account transactions"
    })

    // Add account
    builder.addCase(addAccount.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(addAccount.fulfilled, (state, action) => {
      state.isLoading = false
      state.accounts.push(action.payload.data.account)
    })
    builder.addCase(addAccount.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload?.message || "Failed to add account"
    })

    // Update account
    builder.addCase(updateAccount.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(updateAccount.fulfilled, (state, action) => {
      state.isLoading = false
      const index = state.accounts.findIndex(acc => acc.id === action.payload.data.account.id)
      if (index !== -1) {
        state.accounts[index] = action.payload.data.account
      }
    })
    builder.addCase(updateAccount.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload?.message || "Failed to update account"
    })

    // Delete account
    builder.addCase(deleteAccount.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(deleteAccount.fulfilled, (state, action) => {
      state.isLoading = false
      state.accounts = state.accounts.filter(acc => acc.id !== action.payload)
    })
    builder.addCase(deleteAccount.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload?.message || "Failed to delete account"
    })

    // Set default account
    builder.addCase(setDefaultAccount.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(setDefaultAccount.fulfilled, (state, action) => {
      state.isLoading = false
      const index = state.accounts.findIndex(acc => acc.id === action.payload.data.accounts[0].id)
      if (index !== -1) {
        state.accounts[index] = action.payload.data.accounts[0]
      }
    })
    builder.addCase(setDefaultAccount.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload?.message || "Failed to set default account"
    })
  },
})

export const { setAccounts, selectAccount, clearSelectedAccount, clearAccountsError } = accountsSlice.actions

export default accountsSlice.reducer
