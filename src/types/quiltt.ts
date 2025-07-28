// types/quiltt.ts
import type { Transaction } from '../utils/types';  

// Base Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// More specific connection status
export type QuilttConnectionStatus = 
  | 'INITIALIZING' 
  | 'SYNCING' 
  | 'SYNCED' 
  | 'ERROR_REPAIRABLE' 
  | 'ERROR_SERVICE' 
  | 'ERROR_PROVIDER' 
  | 'ERROR_INSTITUTION' 
  | 'DISCONNECTING' 
  | 'DISCONNECTED';

  export enum QuilttAccountType {
    CHECKING = 'CHECKING',
    SAVINGS = 'SAVINGS',
    CREDIT = 'CREDIT',
  }
  
  export enum QuilttProvider {
    MX = 'MX',
    DISCONNECTED = 'DISCONNECTED'
  }

  export interface QuilttProfile {
    id: string;
    userId: number;  // Should be number, not string (matches User model's Int id)
    uuid: string;
    email?: string | null;  
    name?: string | null;   
    metadata?: JSON;      
    address?: JSON;        
    dateOfBirth?: Date;    
    names?: JSON;         
    connections?: QuilttConnection[];
    createdAt?: Date;
    updatedAt?: Date;
  }

  export interface QuilttAccount {
    id: string;
    connectionId: string;
    userId: number;
    name: string;
    type: string;
    mask?: string;
    balance?: {
      current: number | null;
      available: number | null;
    };
    currentBalance?: number;
    availableBalance?: number;
    metadata?: Record<string, any>;
    institution?: {
      name: string;
      logo?: {
        url: string;
      };
    };
  }

export interface QuilttConnection {
  id: string;         // Was missing
  profileId: string;  // Links to QuilttProfile
  provider: 'MX' | 'DISCONNECTED';  // Match your enum
  status: QuilttConnectionStatus;
  institution?: {
    name: string;
    logo?: {
      url: string;
    };
  };
  metadata?: Record<string, any>;
  lastSyncedAt?: Date;
  lastSyncError?: string;
  syncAttempts: number;
  createdAt?: Date;
  updatedAt?: Date;
  accounts?: QuilttAccount[];
  profile?: QuilttProfile;  // Optional back-reference
}

export interface QuilttTransaction {
  id: string;
  accountId: string;
  userId: number;       
  date: Date;           
  description: string;
  amount: number;
  pending: boolean;   
  merchant?: string;
  category?: string;
  correlationId?: string; 
  entryType?: string;
  status?: string;
  metadata?: JSON;
  transactionId?: number;
  account?: QuilttAccount; 
  transaction?: Transaction;
}

// GraphQL specific types
export interface TransactionNode {
  profileId: string;
  date: string;
  description: string;
  amount: number;
  entryType: 'CREDIT' | 'DEBIT';
  status: 'PENDING' | 'POSTED';
  merchant?: string;
  category?: string;
  account: {
    id: string;
    name: string;
  };
}

export interface ConnectionsGraphQLResponse {
  profile: {
    id: string;
  };
  connections: QuilttConnection[];
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface TransactionEdge {
  node: TransactionNode;
  cursor: string;
}

export interface TransactionConnection {
  edges: TransactionEdge[];
  pageInfo: PageInfo;
}

export interface AccountTransactionsResponse {
  account: {
    transactions: TransactionConnection;
  };
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// State management types
export interface ConnectionState {
  status: 'idle' | 'initializing' | 'connecting' | 'connected' | 'syncing' | 'error';
  message?: string;
  profileId?: string;
  connectionId?: string;
}

export interface SyncProgress {
  current: number;
  total: number;
  accountName: string;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  message?: string;
  progress?: SyncProgress;
}

// Error handling types
export interface QuilttError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status?: number;
  retryable?: boolean;
}