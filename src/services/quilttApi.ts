// services/quilttApi.ts
import api from '../utils/api';
import type { 
  QuilttConnection,
  QuilttAccount,
  TransactionNode,
  TransactionEdge,
  AccountTransactionsResponse
} from '../types/quiltt';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

export const quilttApi = {
  // Keep token management
  getSessionToken(): string | null {
    return localStorage.getItem('quilttSessionToken');
  },

  setSessionToken(token: string): void {
    localStorage.setItem('quilttSessionToken', token);
  },

  clearSessionToken(): void {
    localStorage.removeItem('quilttSessionToken');
  },

  getAuthHeaders() {
    const sessionToken = this.getSessionToken();
    if (sessionToken) {
      return {
        Authorization: `Bearer ${sessionToken}`,
        'X-Quiltt-Session-Token': sessionToken,
      };
    }
    return {};
  },

  // Keep initialize and save profile REST endpoints - they're doing DB operations
  async initialize(): Promise<ApiResponse<{ sessionToken: string }>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      console.log('Initialize request with token:', !!accessToken);
  
      const response = await api.post('/quiltt/initialize', {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
  
      if (response.data.status === 'success' && response.data.data?.sessionToken) {
        this.setSessionToken(response.data.data.sessionToken);
      }
  
      return response.data;
    } catch (error) {
      console.error('Error initializing Quiltt:', error);
      throw error;
    }
  },

  async saveProfile(profileId: string, connectionId: string): Promise<ApiResponse<{
    isSyncing: boolean;
    message: string;
  }>> {
    try {
      const response = await api.post('/quiltt/save-profile', {
        profileId,
        connectionId,
      });
      return response.data;
    } catch (error) {
      console.error('Error saving Quiltt profile:', error);
      throw error;
    }
  },


  async saveConnection(connectionId: string): Promise<ApiResponse<{
    connection: QuilttConnection;
    accounts: QuilttAccount[];
  }>> {
    try {
      const connectionData = await this.getConnectionsGraphQL();
      const connection = connectionData.connections.find(c => c.id === connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }

      // Transform accounts to match your schema
      const accounts = (connection.accounts || []).map(account => ({
        id: account.id,
        name: account.name,
        type: account.type,
        mask: account.mask,
        balance: {
          current: account.balance?.current,
          available: account.balance?.available
        }
      }));

      // Save to database with transformed data
      const response = await api.post('/quiltt/save-connection', {
        connection: {
          id: connection.id,
          provider: connection.provider,
          status: connection.status,
          institution: connection.institution,
          profileId: connectionData.profile.id  // From the same GraphQL query
        },
        accounts
      });

      return response.data;
    } catch (error) {
      console.error('Error saving connection:', error);
      throw error;
    }
  },

  async graphqlRequest<T>(query: string, variables = {}): Promise<T> {
    try {
      const sessionToken = this.getSessionToken();
      
      // If no session token, we need to initialize
      if (!sessionToken) {
        console.log('No session token found, initializing...');
        const initResponse = await this.initialize();
        if (initResponse.status !== 'success') {
          throw new Error('Failed to initialize session');
        }
      }
  
      // Get the token again after potential initialization
      const currentToken = this.getSessionToken();
      if (!currentToken) {
        throw new Error('No session token available after initialization');
      }
  
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      };
  
      console.log('GraphQL Request Debug:', {
        hasToken: !!currentToken,
        tokenPrefix: currentToken?.substring(0, 10),
        endpoint: 'https://api.quiltt.io/v1/graphql'
      });
  
      const response: Response = await fetch('https://api.quiltt.io/v1/graphql', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GraphQL Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          headers: Object.fromEntries(response.headers)
        });
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }
  
      const result: { data?: T; errors?: any[] } = await response.json();
      
      if (result.data) {
        return result.data;
      }
  
      throw new Error(result.errors?.[0]?.message || 'Unknown GraphQL error');
    } catch (error) {
      console.error('GraphQL request failed:', error);
      throw error;  // Changed from returning empty connections to throwing
    }
  },

  async getConnectionsGraphQL(): Promise<{ profile: { id: string }, connections: QuilttConnection[] }> {
    const query = `
      query GetConnections {
        profile {
          id
        }
        connections {
          id
          provider
          status
          institution {
            name
            logo {
              url
            }
          }
          accounts {
            id
            name
            type
            mask
            balance {
              current
              available
            }
          }
        }
      }
    `;
  
    return this.graphqlRequest<{ profile: { id: string }, connections: QuilttConnection[] }>(query);
  },

async saveTransactions(accountId: string, transactions: TransactionNode[]): Promise<ApiResponse<{
  saved: number;
  errors: number;
}>> {
  try {
    const response = await api.post(`/quiltt/save-transactions`, {
      accountId,
      transactions
    });
    return response.data;
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
},

  async getAllAccountTransactions(
    accountId: string, 
    taxYear: number
  ): Promise<TransactionNode[]> {
    const query = `
      query GetAccountTransactions(
        $accountId: ID!, 
        $startDate: Date!, 
        $endDate: Date!
      ) {
        account(id: $accountId) {
          transactions(
            filter: { 
              date_gte: $startDate,
              date_lte: $endDate
            }
          ) {
            edges {
              node {
                id
                date
                description
                amount
                pending
                merchant
                category
                entryType
                status
                correlationId
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;
   
    try {
      const transactions: TransactionNode[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;
  
      while (hasNextPage) {
        const response: AccountTransactionsResponse = await this.graphqlRequest<AccountTransactionsResponse>(query, {
          accountId,
          startDate: `${taxYear}-01-01`,
          endDate: `${taxYear}-12-31`,
          cursor
        });
  
        response.account.transactions.edges.forEach((edge: TransactionEdge) => {
          transactions.push(edge.node);
        });
  
        hasNextPage = response.account.transactions.pageInfo.hasNextPage;
        cursor = response.account.transactions.pageInfo.endCursor;
      }
  
      return transactions;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  },

  // Add this to quilttApi object
async getSyncStatus(connectionId: string): Promise<ApiResponse<{
  status: string;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  isSyncing: boolean;
}>> {
  try {
    const response = await api.get(`/quiltt/sync-status/${connectionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting sync status:', error);
    throw error;
  }
},

  
}; 