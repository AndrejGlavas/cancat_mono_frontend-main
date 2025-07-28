/////src/services/transactionsApi.ts//////

import axios from 'axios';
import api from '../utils/api';
import { 
  BulkUpdateParams,
  TransactionParams, 
  TransactionsResponse, 
  Transaction,
  TransactionCategories,
  TransactionQueryParams,
  TransLog,
  TransactionTag,
  Tag,
  BulkUpdateResponse
} from '../utils/types';

export const transactionsApi = {
  async fetch(params: TransactionParams): Promise<TransactionsResponse> {
    try {
      console.log('TransactionsAPI fetch params:', params);

      const apiParams: Record<string, string | number | boolean | undefined> = {
        page: params.page,
        pageSize: params.itemsPerPage,
        sortColumn: params.sortColumn,
        sortDirection: params.sortDirection,
        type: params.transactionType
      };

      // Spread visibility preferences at the top level
      if (params.visibilityPreferences) {
        Object.assign(apiParams, {
          showHidden: params.visibilityPreferences.showHidden,
          showLocked: params.visibilityPreferences.showLocked,
          showFlagged: params.visibilityPreferences.showFlagged
        });
      }

      // Spread filter properties if they exist
      if (params.filters) {
        const { search, minAmount, maxAmount, month, bankId, split } = params.filters;
        Object.assign(apiParams, {
          search,
          minAmount: minAmount !== undefined ? Number(minAmount) : undefined,
          maxAmount: maxAmount !== undefined ? Number(maxAmount) : undefined,
          month,
          // Handle bankId properly - ensure it's passed as a number
          bankId: bankId !== undefined ? Number(bankId) : undefined, 
          split  
        });

        // Log the bankId specifically to verify it's being passed
        console.log('Bank ID being passed to API:', apiParams.bankId);
      }

      // Remove undefined values but keep zero values for bankId
      Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === undefined || apiParams[key] === '') {
          delete apiParams[key];
        }
      });

      // Log final params being sent to API
      console.log('Final API params:', apiParams);
    const response = await api.get('/transactions', { 
      params: apiParams
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
},


  async put(id: number, transaction: Partial<Transaction>): Promise<Transaction> {
    try {
      const response = await api.put(`/transactions/${id}`, transaction);
      return response.data;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },


    async bulkupdate(params: BulkUpdateParams): Promise<BulkUpdateResponse> {
      console.log('Initiating bulk update:', params);
      
      try {
        if (!params.transactionIds.length) {
          throw new Error('No transactions selected');
        }

        const response = await api.post('/bulkupdate', params);
        return response.data;
      } catch (error) {
        console.error("Error in bulk update:", {
          error,
          params,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    },

    async getTags(type: string): Promise<Tag[]> {
      try {
        const response = await api.get(`/tags`, {
          params: { type }
        });
        
        // Access the data array from the response
        return response.data.data || [];
      } catch (error) {
        console.error("Error fetching tags:", error);
        throw error;
      }
    },

    //updated 24
  async getTransactionTag(transactionId: number): Promise<TransactionTag | null> {
    try {
      const response = await api.get(`/transactions/${transactionId}/tag`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },


  async updateCategory(
    transactionId: number,
    {
      business,
      flag,
      lock,
      hidden,
      split,
      income,
      deposit,
      incomew2,
      expense
    }: {
      business: boolean;
      flag: boolean;
      lock: boolean;
      hidden: boolean;
      split: boolean;
      income?: boolean;
      incomew2?: boolean;
      deposit?: boolean;
      expense?: boolean;
    }
  ): Promise<TransactionCategories> {
    try {
      const response = await api.put(`/transactions/${transactionId}/category`, {
        business,
        flag,
        lock,
        hidden,
        split,
        income,
        incomew2,
        deposit,
        expense
      });
      return response.data;
    } catch (error) {
      console.error("Error updating transaction categories:", error);
      throw error;
    }
  },

  async updateTransactionTag(transactionId: number, tagId: number | null): Promise<Transaction> {
    try {
      const response = await api.put(`/transactions/${transactionId}/tag`, {
        tagId: tagId || null // null to remove the tag
      });
      return response.data;
    } catch (error) {
      console.error("Error updating transaction tag:", error);
      throw error;
    }
  },

  async getCategories(transactionId: number): Promise<TransactionCategories> {
    try {
      const response = await api.get(`/transactions/${transactionId}/category`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction categories:", error);
      throw error;
    }
  },

  async updateLabel(
    transactionId: number,
    label: string,
    replaceAllLabel: boolean = false,
    applyToFuture: boolean = false
  ): Promise<Transaction> {
    try {
      const response = await api.put(`/transactionlabel/${transactionId}`, {
        label,
        replaceAllLabel,
        applyToFuture,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating transaction label:", error);
      throw error;
    }
  },



  async getLogs(transactionId: number): Promise<TransLog[]> {
    try {
      const response = await api.get(`/translog/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction logs:", error);
      throw error;
    }
  },

  async getLogCount(transactionId: number): Promise<number> {
    try {
      const response = await api.get(`/translog/count/${transactionId}`);
      return response.data.count;
    } catch (error) {
      console.error("Error getting transaction log count:", error);
      return 0;
    }
  },

  async addLog(params: {
    fieldName: string;
    oldValue: string;
    newValue: string;
    transactionId: number;
    method?: 'human' | 'robot' | 'rule';
  }): Promise<any> {
    try {
      const response = await api.post('/translog', params);
      return response.data;
    } catch (error) {
      console.error("Error adding transaction log:", error);
      throw error;
    }
  },
  

  async getTotal(): Promise<number> {
    try {
      const response = await api.get("/totaltransactions");
      return response.data;
    } catch (error) {
      console.error("Error fetching total transactions:", error);
      throw error;
    }
  },

async getIncomeTransactions(params: TransactionQueryParams): Promise<TransactionsResponse> {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    console.log('Calling income API...');
    const response = await api.get(`/income?${queryParams.toString()}`);
    console.log('Income API response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching income transactions:", error);
    throw error;
  }
}

};