/////////src/utils/types.ts////////////

// Tags and Categories
export interface Tag {
  id: number;
  name: string;
  type: TransactionType;
  userId: number;
}

export interface TransactionTag {
  id: number;
  name: string;
  type: TransactionType;
  userId: number;
}

export interface CategoryTag {
  name: string;
  count: number;
  amount: number;
}

// Enums
export enum TransactionType {
  BUSINESS = "BUSINESS",
  PERSONAL = "PERSONAL",
}

// Transactions
export interface Transaction {
  id: number;
  date: string;
  label: string;
  amount: number;
  custom: string | null;
  tag: TransactionTag | null;
  tagId: number | null;
  business: boolean;
  income: boolean;
  incomew2: boolean;
  deposit: boolean;
  flag: boolean;
  hidden: boolean;
  lock: boolean;
  source: string;
  split: boolean;
  accountId?: number;
  uploadId?: number;
  plaidTransactionId?: string | null;
  merchant?: string | null;
  category?: string | null;
  pending?: boolean;
  userId: number;
}

export interface TransactionsResponse {
  status: string;
  transactions: Transaction[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

// Transaction Filters and Query
export interface TransactionFilters {
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  month?: string;
  bankId?: number;
  split?: boolean; 
}

export interface VisibilityPreferences {
  showHidden: boolean;
  showLocked: boolean;
  showFlagged: boolean;
}

export interface SortState {
  column: "date" | "label" | "amount";
  direction: "asc" | "desc";
}

export interface TransactionQueryState {
  visibilityPreferences: VisibilityPreferences;
  transactionType?: TransactionType;
  filters: TransactionFilters;
  sort: SortState;
  bulkSelection?: BulkSelection;
}

export interface TransactionQueryParams {
  page?: number;
  itemsPerPage?: number;
  visibilityPreferences?: {
    showHidden?: boolean;
    showLocked?: boolean;
    showFlagged?: boolean;
    showSplit?: boolean;
  };
  transactionType?: TransactionType;
  filters?: {
    search?: string;
    minAmount?: number;
    maxAmount?: number;
    month?: string;
    split?: boolean;
    sortColumn?: "date" | "label" | "amount";
    sortDirection?: "asc" | "desc";
  };
}

export interface TransactionParams {
  page: number;
  itemsPerPage: number;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  visibilityPreferences?: VisibilityPreferences;
  transactionType?: TransactionType;
  filters?: TransactionFilters;
}

export interface FetchTransactionsParams {
  page: number;
  itemsPerPage: number;
  queryState: TransactionQueryState;
}

export interface TransactionCategories {
  business: boolean;
  flag: boolean;
  lock: boolean;
  hidden: boolean;
  split: boolean;
  tagId: number | null;
}

// Bulk Operations


export enum BulkOperationType {
  BUSINESS = "BUSINESS",
  PERSONAL = "PERSONAL",
  LABEL = "LABEL",
  TAG = "TAG",
  CATEGORY = "CATEGORY",
  STATUS = "STATUS",
  SPLIT = "SPLIT",
  FLAG = "FLAG",
  LOCK = "LOCK",
  HIDE = "HIDE",
}

export interface BulkSelection {
  selectedIds: number[];
  selectedTransactions: { id: number; business: boolean }[];
  isLabelBulk: boolean;
  isBusinessBulk: boolean;
  isPersonalBulk: boolean;
  isTagBulk: boolean;
  isCategoryBulk: boolean;
  isStatusBulk: boolean;
  isSplitBulk: boolean;
  isFlagBulk: boolean;
  isLockBulk: boolean;
  isHideBulk: boolean;
  targetType?: BulkOperationType;
  label?: string;
  splitData: boolean | null;
  flagData: boolean | null;
  lockData: boolean | null;
  hideData: boolean | null;
  tagCat?: string;
  tagId?: string;
}

export interface BulkUpdateParams {
  transactionIds: number[];
  operation: BulkOperationType;
  data: {
    business?: boolean;
    label?: string;
    tagId?: number;
  };
}

export interface BulkUpdateResponse {
  status: "success" | "error";
  updatedCount: number;
  message?: string;
}

// Logs
export interface TransLog {
  id: number;
  timestamp: string;
  transactionId: number;
  fieldName: FieldName;
  oldValue: string | null;
  newValue: string | null;
  method: Method;
  special: Special;
  comment: string | null;
  algo: string | null;
  priorTransLogId: number | null;
}

export type Method = "human" | "robot" | "rule" | "bulk";
export type Special = "split" | "revert" | null;
export type FieldName =
  | "label"
  | "category"
  | "flag"
  | "lock"
  | "hide"
  | "split";

  export interface TransactionLogCounts {
    [key: number]: boolean;
  }
  
 export interface ActivityUser {
    id: number;
    name: string;
    updatedAt: string;
   }
   
 export  interface Activity {
    user: ActivityUser;
    transactions: Transaction[] & {
      transLogs: TransLog[];
    };
   }

   export interface Account {
    id: number;
    name: string;
    officialName?: string;
    type: string;
    subtype?: string;
    mask?: string;
    currentBalance?: number;
    availableBalance?: number;
    isoCurrencyCode?: string;
    plaidItem: {
      plaidInstitutionId: string;
      status: string;
    };
  }
  

// Bank and Account
export interface Bank {
  id: number;
  name: string;
  userId: number;
  isCustomBank: boolean;
}

export interface AddBankRequest {
  bankName: string;
  isCustomBank: boolean;
}

export interface BankResponse {
  status: "success" | "error";
  data?: Bank;
  error?: string;
}

export interface BanksListResponse {
  status: "success" | "error";
  data?: Bank[];
  error?: string;
}



// Base stats interface used in multiple places
export interface UploadStats {
  positiveTransactions: number;
  negativeTransactions: number;
  withdrawalsArePositive: boolean;
  totalRows?: number;
  validRows?: number;
  invalidDates?: number;
  nullTransactions?: number;
}

// Base error interface
export interface ApiError {
  message: string;
  details?: string;
  code?: number;
}

// File details
export interface UploadFile {
  id: number;
  bankId: number;
  createdAt: string;
  userId: number;
  status: string;
  fileName: string;
  transactionsCount?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface FileUploadState {
  file: File;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  uploadedTransactions?: number;
  stats?: UploadStats;
  error?: ApiError;
 }



export interface SampleDataStatus {
  hasSampleData: boolean;
}

export interface UploadCSVResponse {
  uploadedRows: number;
  stats: UploadStats;
}

export interface UploadTestDataResponse {
  message: string;
  uploadedRows: number;
  stats: UploadStats;
}





// Rules
export interface Rules {
  id: number;
  label: string;
  nickname: string;
}


export interface Source {
  id: string;
  name: string;
}

// Component Props
export interface TransactionTableProps {
  queryState: TransactionQueryState;
  onChange: (updates: Partial<TransactionQueryState>) => void;
  onError: (error: string | null) => void;
}

export interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyData: TransLog[];
}

export interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: number;
}

// Tax Year and Business Percentage
export interface TaxYearResponse {
  status: "success" | "error";
  data?: {
    taxYear: number;
  };
  error?: string;
}

export interface BusinessPercentageResponse {
  status: "success" | "error";
  data?: {
    businessPercentage: number;
  };
  error?: string;
}

export interface UpdateBusinessPercentageRequest {
  businessPercentage: number;
}

