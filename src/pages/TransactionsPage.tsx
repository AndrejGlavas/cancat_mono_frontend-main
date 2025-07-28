//pages/TransactionsPage.tsx//

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TransactionType, TransactionQueryState } from "../utils/types";
import { filterStore } from "../utils/filterStore";
import { BulkUpdater } from "../components/BulkUpdater";
import TransactionsTable from "../components/TransactionsTable";
import TransactionFilters from "../components/TransactionFilters";
import { Alert, AlertDescription } from "../components/ui/alert";
import { transactionsApi } from "../services/transactionsApi";
import { useBulkTransactions } from "../hooks/useBulkTransactions";
//import QuickGuide from "../components/QuickGuide";

const TransactionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Add this

  // Initialize state with stored preferences and URL params
  const [queryState, setQueryState] = useState<TransactionQueryState>(() => {
    console.log("Initial State Creation");
    const stored = filterStore.getState();
    const type = searchParams.get("type");
    const monthParam = searchParams.get("month");
    const splitParam = searchParams.get("split"); // Add this line

    return {
      ...stored,
      transactionType:
        type === "BUSINESS"
          ? TransactionType.BUSINESS
          : type === "PERSONAL"
          ? TransactionType.PERSONAL
          : undefined,
      filters: {
        ...stored.filters,
        search: searchParams.get("search") || undefined,
        month: monthParam ? monthParam.padStart(2, "0") : undefined,
        minAmount: searchParams.get("minAmount")
          ? Number(searchParams.get("minAmount"))
          : undefined,
        maxAmount: searchParams.get("maxAmount")
          ? Number(searchParams.get("maxAmount"))
          : undefined,
        split: splitParam === null ? undefined : splitParam === 'true'
      },
      bulkSelection: {
        selectedIds: [],
        selectedTransactions: [],
        isLabelBulk: false,
        isBusinessBulk: false,
        isPersonalBulk: false,
        isTagBulk: false,
        isCategoryBulk: false,
        isStatusBulk: false,
        isSplitBulk: false,
        isFlagBulk: false,
        isLockBulk: false,
        isHideBulk: false,
        splitData: null,
        flagData: null,
        lockData: null,
        hideData: null,
        targetType: undefined,
        label: undefined,
        tagCat: undefined,
        tagId: undefined,
      },
    };
  });

  const handleStateChange = (updates: Partial<TransactionQueryState>) => {
    console.log("handleStateChange Called", {
      updates,
      currentState: queryState,
      timestamp: new Date().toISOString(),
    });

    setQueryState((prev) => {
      const formattedUpdates = {
        ...updates,
        filters: updates.filters && {
          ...updates.filters,
          month: updates.filters.month
            ? updates.filters.month.toString().padStart(2, "0")
            : updates.filters.month,
        },
      };

      const newState = {
        ...prev,
        ...formattedUpdates,
        visibilityPreferences: {
          ...prev.visibilityPreferences,
          ...(formattedUpdates.visibilityPreferences || {}),
        },
        filters: {
          ...prev.filters,
          ...(formattedUpdates.filters || {}),
        },
      };

      console.log("New State Created", {
        newState,
        timestamp: new Date().toISOString(),
      });

      return newState;
    });
    setError(null);
  };

  useEffect(() => {
    console.log("URL Sync Effect Triggered", {
      queryState,
      timestamp: new Date().toISOString(),
    });

    const params = new URLSearchParams();

    if (queryState.transactionType) {
      params.set("type", queryState.transactionType);
    }

    if (queryState.filters) {
      Object.entries(queryState.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          if (key === "month") {
            console.log("Setting month in URL:", value);
            params.set(key, value.toString());
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }

    console.log("Setting URL params:", Object.fromEntries(params.entries()));

    filterStore.saveState(queryState);
    setSearchParams(params, { replace: true });
  }, [queryState]);

  const fetchData = async (page: number) => {
    try {
      const response = await transactionsApi.fetch({
        page,
        itemsPerPage: 20,
        sortColumn: queryState.sort.column, // Use the sort from queryState
        sortDirection: queryState.sort.direction,
        filters: queryState.filters,
        visibilityPreferences: queryState.visibilityPreferences, 
        transactionType: queryState.transactionType,
      });
      setCurrentPage(page);
      return response;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      throw error; // Propagate error
    }
  };

  const {
    isUpdating,
    handleBulkOperationClick,
    handleBulkTypeUpdate,
    handleBulkLabelUpdate,
    clearBulkSelection,
  } = useBulkTransactions({
    queryState,
    onChange: handleStateChange,
    onUpdateComplete: () => fetchData(currentPage),
    onError: setError,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Column - Filters and Bulk Updater */}
        <div className="w-full md:w-1/4 space-y-4">
          {/* Desktop Filters */}
          <div className="hidden md:block">
            <TransactionFilters
              queryState={queryState}
              onChange={handleStateChange}
              onError={setError}
            />

            <BulkUpdater
              selectedCount={queryState.bulkSelection?.selectedIds?.length || 0}
              onBulkUpdateClick={handleBulkOperationClick}
              onUpdate={() =>
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                handleBulkTypeUpdate(queryState.bulkSelection?.targetType!)
              }
              isUpdating={isUpdating}
              currentSelectedType={queryState.bulkSelection?.targetType}
              onClear={() => clearBulkSelection()}
              onBulkLabelSubmit={handleBulkLabelUpdate}
              queryState={queryState}
              onError={setError as () => void}
            />
          </div>
          {/* <div className="hidden md:block">
            <QuickGuide />
          </div> */}
        </div>
        {/* Mobile Filters */}
        <div className="md:hidden w-full">
          <TransactionFilters
            queryState={queryState}
            onChange={handleStateChange}
            onError={setError}
          />
        </div>

        {/* Right Column - Transactions Table */}
        <div className="w-full md:w-3/4">
          <TransactionsTable
            queryState={queryState}
            onChange={handleStateChange}
            onError={setError}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
