import React, { useState, useEffect } from "react";  // updated 24
import {
  Flag,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Pencil,
  History
} from "lucide-react";

import { transactionsApi } from "../services/transactionsApi";
import SplitIcon from "./ui/SplitIcon";
import {
  TransactionTableProps,
  TransactionLogCounts,
  TransactionType,
  SortState,
} from "../utils/types";

import { useTransactions } from "../hooks/useTransactions";
import { useTransactionSort } from "../hooks/useTransactionSort";
import TransactionVisibilityControls from "./TransactionVisibilityControls";
import { useTransactionTags } from "../hooks/useTransactionTags";
import { useTransactionCategories } from "../hooks/useTransactionCategories";
import { useTransactionLabels } from "../hooks/useTransactionLabels";
import { usePagination } from "../hooks/usePagination";
import { BulkSelectionHeader } from "./BulkSelectionHeader";
import { BulkSelectionCell } from "./BulkSelectionCell";

import LogModal from "./ui/LogModal";
import TagModal from "./ui/TagModal";
import TagButton from "./ui/TagButton";
import { Card } from "./ui/Card";

const TransactionsTable: React.FC<TransactionTableProps> = ({
  queryState,
  onChange,
  onError,
}) => {
  // Core table state
  const { sortColumn, sortDirection, handleSort } = useTransactionSort("date");
  const ITEMS_PER_PAGE = 20;

  // Data fetching & pagination
  const { rowData, totalRecords, isLoading, fetchData } = useTransactions({
    itemsPerPage: ITEMS_PER_PAGE,
    queryState: {
      ...queryState,
      sort: { column: sortColumn, direction: sortDirection },
    },
    onError,
  });

  const { currentPage, totalPages, handlePageChange, hasPrevious, hasNext } =
    usePagination({
      totalRecords,
      itemsPerPage: ITEMS_PER_PAGE,
      onPageChange: fetchData,
    });

  // Transaction mutations
  const { handleTransactionTypeChange, handleStatusToggle } =
    useTransactionCategories({
      queryState,
      onChange,
      onUpdateComplete: () => fetchData(currentPage),
    });

  // Label editing
  const {
    editingLabel,
    newLabel,
    setNewLabel,
    handleLabelEdit,
    handleLabelSave,
    bulkLabelEdit,
  } = useTransactionLabels(() => fetchData(currentPage));

  // Tag handling
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<TransactionType | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const {
    selectedTagTransId,
    setSelectedTagTransId,
    availableTags,
    fetchTags,
    updateTag,
  } = useTransactionTags(() => fetchData(currentPage));

  const openTagModal = (transactionId: number, business: boolean) => {
    const transactionType = business
      ? TransactionType.BUSINESS
      : TransactionType.PERSONAL;
    setSelectedTransactionType(transactionType);
    fetchTags(transactionType);
    setSelectedTagTransId(transactionId);
    setShowTagModal(true);
  };

  // Transaction history
  const [isOpen, setIsOpen] = useState(false);
  const [historyTransactionId, setHistoryTransactionId] = useState<
    number | null
  >(null);
  const [transactionsWithLogs, setTransactionsWithLogs] =
    useState<TransactionLogCounts>({});

  useEffect(() => {
    fetchData(currentPage || 1);
  }, [queryState, sortColumn, sortDirection, currentPage]);

  useEffect(() => {
    const fetchLogCounts = async () => {
      if (!rowData.length) return;

      const counts: Record<number, boolean> = {};
      try {
        await Promise.all(
          rowData.map(async (transaction) => {
            try {
              counts[transaction.id] =
                (await transactionsApi.getLogCount(transaction.id)) > 0;
            } catch (error) {
              counts[transaction.id] = false;
            }
          })
        );
        setTransactionsWithLogs(counts);
      } catch (error) {
        console.error("Error in fetchLogCounts:", error);
      }
    };

    fetchLogCounts();
  }, [rowData]);

  const SortHeader = ({
    column,
    label,
  }: {
    column: SortState["column"];
    label: string;
  }) => (
    <th
      className="p-3 text-left cursor-pointer hidden md:table-cell"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortColumn === column && (
          <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </th>
  );

  return (
    <div className="w-full space-y-4">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-[#4338CA]">
            {totalRecords} Expenses
          </h2>
          <div className="w-full sm:w-auto">
            <TransactionVisibilityControls
              visibilityPreferences={queryState.visibilityPreferences}
              onVisibilityChange={(preferences) => {
                onChange({ ...queryState, visibilityPreferences: preferences });
                fetchData(currentPage);
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sort Controls */}
      <div className="flex gap-2 overflow-x-auto md:hidden p-4 bg-white rounded-lg shadow">
        <button
          onClick={() => handleSort("date")}
          className={`px-3 py-1 rounded-full ${
            sortColumn === "date" ? "bg-blue-100 text-blue-800" : "bg-gray-100"
          }`}
        >
          Date {sortColumn === "date" && (sortDirection === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSort("label")}
          className={`px-3 py-1 rounded-full ${
            sortColumn === "label" ? "bg-blue-100 text-blue-800" : "bg-gray-100"
          }`}
        >
          Label{" "}
          {sortColumn === "label" && (sortDirection === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSort("amount")}
          className={`px-3 py-1 rounded-full ${
            sortColumn === "amount"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100"
          }`}
        >
          Amount{" "}
          {sortColumn === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="w-full h-32 flex items-center justify-center bg-white rounded-lg shadow">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      ) : (
        <>
                {/* Desktop View */}
                <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <BulkSelectionHeader
                      rowData={rowData}
                      queryState={queryState}
                      bulkLabelEdit={bulkLabelEdit}
                      onChange={onChange}
                    />
                    <th className="p-3 text-left">Sort</th>
                    <th className="p-3 text-left">Tag </th>
                    <SortHeader column="date" label="Date" />
                    <SortHeader column="label" label="Label" />
                    <SortHeader column="amount" label="Amount" />
                    <th className="p-3 text-left">Clear</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rowData.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <BulkSelectionCell
                        transactionId={transaction.id}
                        isLocked={transaction.lock}
                        isBusiness={transaction.business}
                        queryState={queryState}
                        bulkLabelEdit={bulkLabelEdit}
                        onChange={onChange}
                      />
                      <td className="p-3 m-4 justify-center">
                      <div className="flex items-center gap-1 ">
                      <div>
                        <button title="Business or Personal?"
                          onClick={() =>
                            handleTransactionTypeChange(
                              transaction.id,
                              transaction.business
                                ? TransactionType.PERSONAL
                                : TransactionType.BUSINESS
                            )
                          }
                          className={`w-12 h-12 rounded-full flex items-center justify-center bg-white font-serif font-bold text-lg
                              ${
                                transaction.business
                                  ? "border-4 border-blue-700 text-blue-700"
                                  : "border-4 border-green-700 text-green-700"
                              }`}
                        >
                          {transaction.business ? "B" : "P"}
                        </button>

                      </div>
                      <div>                
                      <button title="Split to deduct a percentage"
                        onClick={() => handleStatusToggle(transaction.id, "split", transaction)}
                        className="rounded-lg"
                      >
                        <SplitIcon 
                          variant="toggle"
                          state={transaction.split || false}
                        />
                      </button>
                        </div>
                        </div>
                      </td>
                      <td className="p-2">
                      <div className="flex items-center gap-0 ">
                      <div>
                        <TagButton 
                          id={Number(transaction.id)}
                          tag={transaction.tag}
                          business={Boolean(transaction.business)}
                          openTagModal={openTagModal}
                          onUpdate={() => fetchData(currentPage)} 
                        />
                        </div>
                        <div>
                        <button title="Flag"
                            onClick={() => {
                              console.log(transaction.id, transaction.flag);
                              handleStatusToggle(
                                transaction.id,
                                "flag",
                                transaction
                              );
                            }}
                            className={
                              transaction.flag
                                ? "text-red-400  border-red-300 bg-red-50 p-1 border rounded-md"
                                : "text-gray-400   border-red-100 p-1 border rounded-md"
                            }
                          >
                            <Flag size={14} />
                          </button>
                          </div>
                          </div>
                      </td>
                     
                      <td className="p-3">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {editingLabel === transaction.id ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={newLabel}
                              onChange={(e) => setNewLabel(e.target.value)}
                              className="border rounded px-2 py-1"
                            />
                            <button
                              onClick={handleLabelSave}
                              className="ml-2 text-indigo-500 underline"
                            >
                              SAVE
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span 
                              className={`text-gray-600 truncate block max-w-[300px] ${transaction.custom ? 'underline decoration-dotted' : ''}`}
                              title={transaction.custom ? transaction.label : undefined}
                            >
                              {transaction.custom || transaction.label}
                            </span>
                            <button 
                              onClick={() =>
                                handleLabelEdit(
                                  transaction.id,
                                  transaction.custom || transaction.label
                                )
                              }
                              >
                                <Pencil className="text-zinc-500 border-zinc-200 bg-zinc-50 p-1 w-6 h-6 border-2 rounded-md ml-2" />
                              </button>
                            </div>
                          )}
                      </td>
                      <td className="p-3 text-gray-600 font-semibold">
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-5">

                        
                          <button title="Lock"
                            onClick={() =>
                              handleStatusToggle(
                                transaction.id,
                                "lock",
                                transaction
                              )
                            }
                          >
                            {transaction.lock ? (
                              <Lock size={24} className="text-yellow-900 border-yellow-900 bg-orange-50 p-1 border rounded-md" />
                            ) : (
                              <LockOpen size={24} className="text-gray-400 border-gray-400 p-1 border rounded-md" />
                            )}
                          </button>
                          <button title="Hide"
                            onClick={() =>
                              handleStatusToggle(
                                transaction.id,
                                "hidden",
                                transaction
                              )
                            }
                          >
                            {transaction.hidden ? (
                              <EyeOff size={24} className="text-orange-300 border-orange-300 bg-yellow-50 p-1 border rounded-md" />
                            ) : (
                              <Eye size={24} className="text-gray-400 border-gray-400 p-1 border rounded-md" />
                            )}
                          </button>
                    
                          {transactionsWithLogs[transaction.id] && (
                            <button 
                              title="View edit history"
                              onClick={() => {
                                setHistoryTransactionId(transaction.id);
                                setIsOpen(true);
                              }}
                              className="p-2 hover:text-blue-600 transition-colors"
                            >
                              <History className="text-gray-400 border-gray-400 p-1 border rounded-md" />
                            </button>
                          )}
                        
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View - Update with same styling changes */}
          <div className="md:hidden space-y-4">
            {rowData.map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <button
                        onClick={() =>
                          handleTransactionTypeChange(
                            transaction.id,
                            transaction.business
                              ? TransactionType.PERSONAL
                              : TransactionType.BUSINESS
                          )
                        }
                        className={`w-8 h-8 rounded-full flex items-center justify-center bg-white
                            ${
                              transaction.business
                                ? "border-4 border-blue-700 text-blue-700"
                                : "border-4 border-green-700 text-green-700"
                            }`}
                      >
                        {transaction.business ? "B" : "P"}
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                 
                 <TagButton
                   id={Number(transaction.id)}
                   tag={transaction.tag}
                   business={Boolean(transaction.business)}
                   openTagModal={openTagModal}
                   onUpdate={() => fetchData(currentPage)} 
                 />

                 
               </div>
                    <div className="flex gap-3">
                    <button title="Split to deduct a percentage"
                      onClick={() => handleStatusToggle(transaction.id, "split", transaction)}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SplitIcon 
                        variant="toggle"
                        state={transaction.split}
                        size={8}  // Slightly larger for desktop
                      />
                    </button>
                      <button  title="Flag"
                        onClick={() =>
                          handleStatusToggle(
                            transaction.id,
                            "flag",
                            transaction
                          )
                        }
                        className={
                          transaction.flag
                            ? "text-red-400 border-red-300 bg-red-50 p-1 border rounded-lg"
                            : "text-gray-400 border-red-300 "
                        }
                      >
                        <Flag size={12} />
                      </button>
                      <button  title="Hide"
                        onClick={() =>
                          handleStatusToggle(
                            transaction.id,
                            "hidden",
                            transaction
                          )
                        }
                      >
                        {transaction.hidden ? (
                          <EyeOff className="text-orange-300 border-orange-300 bg-orange-50 p-1 w-6 h-6 border-2 rounded-lg" size={16}  />
                        ) : (
                          <Eye className="text-gray-400" size={16}  />
                        )}
                      </button>
                      <button title="Lock"
                        onClick={() =>
                          handleStatusToggle(
                            transaction.id,
                            "lock",
                            transaction
                          )
                        }
                      >
                        {transaction.lock ? (
                          <Lock size={16} className="text-yellow-700 border-yellow-700 bg-yellow-50 p-1 w-6 h-6 border-2 rounded-lg" />
                        ) : (
                          <LockOpen size={16} className="text-gray-400" />
                        )}
                      </button>
                
                   
                    {transactionsWithLogs[transaction.id] && (
               
                      <button
                        onClick={() => {
                          setHistoryTransactionId(transaction.id);
                          setIsOpen(true);
                        }}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <History  size={16} className="text-gray-400" />
                
                      </button>
                   
                  )}
                   </div>
                  </div>

                  {/* Rest of mobile view remains same */}
            

       

                  <div className="space-y-2">
                    <div className="flex">
                    
                      <div className="flex justify-between items-center">
                     
                        {editingLabel === transaction.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newLabel}
                              onChange={(e) => setNewLabel(e.target.value)}
                              className="border rounded px-2 py-1 text-sm w-full"
                            />
                            <button
                              onClick={handleLabelSave}
                              className="text-blue-500 text-sm whitespace-nowrap"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-lg truncate max-w-[200px]">
                              {transaction.custom || transaction.label}
                            </span>
                            <button
                              onClick={() =>
                                handleLabelEdit(
                                  transaction.id,
                                  transaction.custom || transaction.label
                                )
                              }
                            >
                              <Pencil className="text-zinc-500 border-zinc-500 bg-zinc-50 p-1 w-6 h-6 border-2 rounded-lg" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                      <span className="text-sm p-2">
                        {new Date(transaction.date).toLocaleDateString()} </span>        
                        <span className="text-sm p-2"> ${transaction.amount.toFixed(2)}</span> 
                    </div>
                    </div>
                 
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNext}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <LogModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setHistoryTransactionId(null);
        }}
        transactionId={
          historyTransactionId !== null ? historyTransactionId : undefined
        }
      />

      <TagModal
        isOpen={showTagModal}
        tags={availableTags}
        selectedTagTransId={selectedTagTransId}
        setShowTagModal={setShowTagModal}
        handleTagChange={updateTag}
        transactionType={selectedTransactionType!}
      />
    </div>
  );
};

export default TransactionsTable;
