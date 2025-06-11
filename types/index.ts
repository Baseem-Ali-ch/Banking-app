// User related types
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  profileImage?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  dateOfBirth?: string
  createdAt: string
  lastLogin: string
  twoFactorEnabled: boolean
  notificationPreferences: {
    transactions: boolean
    balanceUpdates: boolean
    securityAlerts: boolean
    marketing: boolean
  }
  appPreferences: {
    language: string
    theme: string
    defaultCurrency: string
    defaultAccountId?: string
  }
  verificationStatus: "unverified" | "pending" | "under_review" | "verified" | "rejected"
  verificationDocuments: Array<{
    type: string
    status: "pending" | "under_review" | "verified" | "rejected"
    uploadedAt: string
  }>
  status: UserStatus
  role?: UserRole
  linkedAccounts?: number
  transactionCount?: number
  transactionVolume?: number
  riskLevel?: string
  kycStatus?: string
  lastActivity?: string
  notes?: string
  [key: string]: any // Allow for dynamic access to properties
}

export interface UserResponse {
  success: boolean
  data: {
    user: User & {
      accounts: Array<{
        id: string
        accountHolderName: string
        accountNumber: string
        ifscCode: string
        userId: string
        createdAt: string
        updatedAt: string
      }>
      wallet: {
        id: string
        userId: string
        balance: number
        createdAt: string
        updatedAt: string
      }
      addMoneyTransactions: Array<{
        id: string
        amount: number
        location: string
        description: string
        transactionId: string
        status: string
        userId: string
        createdAt: string
        updatedAt: string
      }>
      transferMoneyTransactions: Array<{
        id: string
        accountId: string
        amount: number
        description: string
        status: string
        userId: string
        createdAt: string
        updatedAt: string
        account: {
          id: string
          accountHolderName: string
          accountNumber: string
          ifscCode: string
          userId: string
          createdAt: string
          updatedAt: string
        }
      }>
      allTransactions: Array<{
        id: string
        orderId: string
        walletId: string
        userId: string
        amount: number
        transactionType: string
        description: string
        addMoneyTransactionId: string | null
        transferMoneyTransactionId: string | null
        createdAt: string
        updatedAt: string
        addMoneyTransaction: {
          id: string
          amount: number
          status: string
          transactionId: string
        } | null
        transferMoneyTransaction: {
          id: string
          amount: number
          status: string
          description: string
          account: {
            id: string
            accountHolderName: string
            accountNumber: string
            ifscCode: string
          }
        } | null
      }>
      _count: {
        accounts: number
        addMoneyTransactions: number
        transferMoneyTransactions: number
        allTransactions: number
      }
    }
  }
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PendingUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: UserRole
  isPortalAccess: boolean
  createdAt: string
  updatedAt: string
}

export interface PendingUserResponse {
  status: string
  message: string
  data: {
    users: PendingUser[]
    pagination: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

export function convertPendingUserToUser(user: PendingUser): User {
  return {
    ...user,
    lastLogin: '', // Add default value
    twoFactorEnabled: false, // Add default value
    notificationPreferences: {
      transactions: false,
      balanceUpdates: false,
      securityAlerts: false,
      marketing: false
    },
    appPreferences: {
      language: 'en',
      theme: 'light',
      defaultCurrency: 'USD'
    }
  }
}

export interface PendingUserResponse {
  status: string
  message: string
  data: {
    users: PendingUser[]
    pagination: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

// Bank Account related types
export interface BankAccount {
  id: string
  userId: string
  accountNumber: string
  accountHolderName: string
  ifscCode: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

export interface AccountPagination {
  currentPage: number
  totalPages: number
  totalAccounts: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface AccountsResponse {
  status: string
  message: string
  data: {
    accounts: BankAccount[]
    pagination: AccountPagination
  }
}

// Transaction related types
export interface Transaction {
  id: string
  userId: string
  fromAccountId: string
  fromAccountName?: string
  fromAccountNumber?: string
  fromIfscCode?: string
  toAccountId: string
  toAccountName?: string
  toAccountNumber?: string
  toIfscCode?: string
  amount: number
  currency: string
  description: string
  category?: TransactionCategory
  status: TransactionStatus
  transactionType: TransactionType
  type: TransactionType
  date: string
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  createdAt: string
  updatedAt: string
}

export enum TransactionCategory {
  TRANSFER = "TRANSFER",
  PAYMENT = "PAYMENT",
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  FEE = "FEE",
  REFUND = "REFUND",
  OTHER = "OTHER",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  PAYMENT = "PAYMENT",
  TRANSFER = "TRANSFER",
  WITHDRAWAL = "WITHDRAWAL",
  ADD_MONEY = "ADD_MONEY",
  TRANSFER_MONEY = "TRANSFER_MONEY",
}

// Notification related types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export enum NotificationType {
  TRANSACTION = "TRANSACTION",
  ACCOUNT = "ACCOUNT",
  SECURITY = "SECURITY",
  SYSTEM = "SYSTEM",
}

// Profile related types
export interface ProfilePreferences {
  notifications: {
    transactionAlerts: boolean
    balanceUpdates: boolean
    securityAlerts: boolean
    marketingCommunications: boolean
  }
  app: {
    language: string
    theme: string
    currency: string
    defaultAccountId: string
  }
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  biometricEnabled: boolean
  lastPasswordChange: string
  loginHistory: LoginHistoryItem[]
}

export interface LoginHistoryItem {
  id: string
  device: string
  browser: string
  location: string
  ip: string
  date: string
  current: boolean
}

export interface VerificationDocument {
  id: string
  type: string
  status: string
  uploadedAt: string
  verifiedAt?: string
  rejectedReason?: string
  fileUrl?: string
}

// Wallet related types
export interface Wallet {
  id: string
  userId: string
  balance: number
  currency: string
  status: WalletStatus
  createdAt: string
  updatedAt: string
}

export interface WalletResponse {
  status: string
  message: string
  data: {
    wallet: {
      id: string
      userId: string
      balance: string
      createdAt: string
      updatedAt: string
      user: {
        id: string
        email: string
        firstName: string
        lastName: string
        phoneNumber: string
        role: string
        isPortalAccess: boolean
        createdAt: string
        updatedAt: string
      }
    }
  }
}

export interface WalletBalanceResponse {
  status: string
  message: string
  data: {
    wallet: {
      id: string
      balance: number
      createdAt: string
      updatedAt: string
    }
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
    }
  }
}

export enum WalletStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  CLOSED = "CLOSED",
}

export interface AddMoneyResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    amount: number;
    location: string;
    description: string;
    userId: string;
    status: WalletTransactionStatus;
    transactionId: any;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface TransferMoneyResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    accountId: string;
    amount: number;
    description: string;
    userId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    account: {
      id: string;
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
    };
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface WalletTransaction {
  id: string
  walletId: string
  userId: string
  amount: number
  currency: string
  type: WalletTransactionType
  transactionType: WalletTransactionType
  status: WalletTransactionStatus
  description: string
  paymentMethod?: PaymentMethod
  reference?: string
  fee?: number
  date: string
  createdAt: string
  updatedAt: string
}

export enum WalletTransactionType {
  DEPOSIT = "DEPOSIT",
  TRANSFER = "TRANSFER",
  ADD_MONEY = "ADD_MONEY",
  TRANSFER_MONEY = "TRANSFER_MONEY",
  WITHDRAWAL = "WITHDRAWAL"

}

export enum WalletTransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED"
}

export enum PaymentMethod {
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  CRYPTO = "CRYPTO",
  OTHER = "OTHER",
}
