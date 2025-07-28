import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Card } from "./ui/Card";
import { BulkOperationType } from "../utils/types";
import { SplitIcon } from "./ui/SplitIcon";
import { TransactionQueryState, TransactionType } from "../utils/types";
import {
  Flag,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PiTag } from "react-icons/pi";
import { usePagination } from "../hooks/usePagination";
import { useTransactions } from "../hooks/useTransactions";
import { useTransactionSort } from "../hooks/useTransactionSort";
import { useTransactionTags } from "../hooks/useTransactionTags";

export interface BulkUpdaterProps {
  selectedCount: number;
  onBulkUpdateClick: (
    type: BulkOperationType,
    value: boolean,
    data?: string | object | null | boolean
  ) => void;
  onUpdate: () => void;
  isUpdating: boolean;
  currentSelectedType?: BulkOperationType;
  onClear?: () => void;
  onBulkLabelSubmit: (label: string) => void;
  queryState: TransactionQueryState;
  onError: () => void;
}

export const BulkUpdater: React.FC<BulkUpdaterProps> = ({
  selectedCount,
  onBulkUpdateClick,
  onUpdate,
  isUpdating,
  currentSelectedType,
  onClear,
  queryState,
  onError,
}) => {
  const { sortColumn, sortDirection } = useTransactionSort("date");
  const ITEMS_PER_PAGE = 20;

  const [showLabelInput, setShowLabelInput] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [label, setLabel] = useState("");

  const [tagCat, setTagCat] = useState<undefined | string>();
  const [tagValue, setTagValue] = useState<string>();
  const [tagText, setTagText] = useState<null | string>();

  const [isSameCat, setIsSameCat] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCat === "B") {
      fetchTags(TransactionType.BUSINESS);
    } else if (selectedCat === "P") {
      fetchTags(TransactionType.PERSONAL);
    }
  }, [selectedCat]);

  const { rowData, totalRecords, fetchData } = useTransactions({
    itemsPerPage: ITEMS_PER_PAGE,
    queryState: {
      ...queryState,
      sort: { column: sortColumn, direction: sortDirection },
    },
    onError,
  });

  const { currentPage } = usePagination({
    totalRecords,
    itemsPerPage: ITEMS_PER_PAGE,
    onPageChange: fetchData,
  });

  const { availableTags, fetchTags, isLoading } = useTransactionTags(() =>
    fetchData(currentPage)
  );

  useEffect(() => {
    if (!rowData.length) {
      fetchData(currentPage);
    } else {
      const cats = new Set();
      queryState.bulkSelection?.selectedIds?.forEach((selectedId) => {
        console.log(rowData);
        const row = rowData.find((row) => +row.id === +selectedId);
        if (row) {
          cats.add(row.business);
        }
      });

      if (cats.size === 1) {
        setIsSameCat(true);
        const [business] = cats;
        setSelectedCat(business ? "B" : "P");
      } else {
        setIsSameCat(false);
        setSelectedCat(null);
        setShowTagPicker(false);
        onBulkUpdateClick(BulkOperationType.TAG, false);
      }
      console.log(queryState.bulkSelection?.selectedIds);
    }
  }, [
    rowData,
    queryState.bulkSelection?.selectedIds,
    queryState.bulkSelection?.selectedIds?.length,
  ]);

  const handleOperationClick = (
    type: BulkOperationType,
    value: boolean,
    data?: string | object | boolean | null
  ) => {
  
  console.log('Bulk Operation Type:', type);
  console.log('Bulk Value:', value);
  console.log('Bulk Data before tripleSwitch:', data);
  console.log('BulkSelection state:', queryState.bulkSelection);
  
    switch (type) {
      case "LABEL":
        onBulkUpdateClick(
          type,
          value || !queryState.bulkSelection?.isLabelBulk
        );
        break;
      case "BUSINESS":
        onBulkUpdateClick(
          type,
          value || !queryState.bulkSelection?.isBusinessBulk
        );
        break;
      case "PERSONAL":
        onBulkUpdateClick(
          type,
          value || !queryState.bulkSelection?.isPersonalBulk
        );
        break;
      case "SPLIT":
        onBulkUpdateClick(type, value, data);
        break;
      case "TAG":
        onBulkUpdateClick(type, value || !queryState.bulkSelection?.isTagBulk);
        break;
      case "CATEGORY":
        onBulkUpdateClick(
          type,
          value || !queryState.bulkSelection?.isCategoryBulk
        );
        break;

      case "FLAG":
        onBulkUpdateClick(type, value, data);
        break;

      case "LOCK":
        onBulkUpdateClick(type, value, data);
        break;

      case "HIDE":
        onBulkUpdateClick(type, value, data);
        break;

      case "STATUS":
        onBulkUpdateClick(
          type,
          value || !queryState.bulkSelection?.isStatusBulk
        );
        break;

      default:
        break;
    }
  };

  const tripleSwitch = (value: boolean | null | undefined) => {
    switch (value) {
      case null:
        return true;
      case true:
        return false;
      case false:
        return null;
      default:
        return true;
    }
  };

  // const bulkLabelEdit = () => {
  //   setShowLabelInput(true);
  //   onBulkUpdateClick(BulkOperationType.LABEL, true);
  // };

  const bulkLabelSubmit = () => {
    if (label.trim()) {
      onBulkUpdateClick(BulkOperationType.LABEL, true, label);
      // onBulkLabelSubmit(label.trim());
      setLabel("");
      setShowLabelInput(false);
    }
  };

  const bulkTagEdit = () => {
    if (showTagPicker) {
      setShowTagPicker(false);
      onBulkUpdateClick(BulkOperationType.TAG, false);
    } else {
      setShowTagPicker(true);
      onBulkUpdateClick(BulkOperationType.TAG, true);
    }
  };

  const bulkTagSubmit = () => {
    onBulkUpdateClick(BulkOperationType.TAG, true, {
      type: tagCat,
      tag: tagValue,
    });
    setTagValue(undefined);
    setTagCat(undefined);
    setShowTagPicker(false);
  };

  return (
    <Card className="p-4 mt-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#4338CA] mb-4">
          Update Multiple Transactions
        </h2>
        <div className="flex gap-4 items-center justify-start font-semibold text-sm">Sort 
          <button
            onClick={() =>
              handleOperationClick(
                BulkOperationType.PERSONAL,
                !queryState?.bulkSelection?.isPersonalBulk
              )
            }
            disabled={
              isUpdating ||
              showLabelInput ||
              showTagPicker ||
              queryState.bulkSelection?.isTagBulk
            }
            className={`w-10 h-10 ml-12 text-lg rounded-full flex items-center justify-center border-4
              ${
                queryState.bulkSelection?.isPersonalBulk
                  ? "border-green-700 text-green-700 font-serif"
                  : "border-gray-300 text-gray-400 font-serif hover:bg-gray-50"
              } 
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            P
          </button>
          <button
            onClick={() =>
              handleOperationClick(
                BulkOperationType.BUSINESS,
                !queryState?.bulkSelection?.isBusinessBulk
              )
            }
            disabled={
              isUpdating ||
              showLabelInput ||
              showTagPicker ||
              queryState.bulkSelection?.isTagBulk
            }
            className={`w-10 h-10 rounded-full flex items-center justify-center border-4 text-lg
              ${
                queryState.bulkSelection?.isBusinessBulk
                  ? "border-blue-700 text-blue-700 font-serif"
                  : "border-gray-300 text-gray-400 font-serif hover:bg-gray-50"
              } 
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            B
          </button>
          <SplitIcon 
              variant="bulk"
              state={queryState.bulkSelection?.splitData}
              onBulkClick={(newState) => 
                handleOperationClick(
                  BulkOperationType.SPLIT,
                  true,
                  newState
                )
              }
              disabled={isUpdating || showLabelInput || showTagPicker}
              size={10}  
            />
        </div>

        <div className="flex gap-2 items-center justify-start font-semibold text-sm">
          <div>
            Tag
          </div>
          <div className="flex items-start gap-2 mx-12">
        {showLabelInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter new label"
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 
                focus:outline-none flex-grow"
              autoFocus
            />
            <button
              onClick={bulkLabelSubmit}
              disabled={isUpdating || !label.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-blue-700 
                disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              SAVE
            </button>
            <button
              onClick={() => {
                setShowLabelInput(false);
                setLabel("");
                onClear?.();
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm underline"
            >
              Cancel Edit
            </button>
          </div>
        )}

        {queryState?.bulkSelection?.isLabelBulk &&
          !!queryState.bulkSelection.label?.length && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.5rem",
              }}
            >
              <p>{queryState.bulkSelection.label}</p>
              <X
                size={16}
                className="text-gray-500 cursor-pointer"
                onClick={() => {
                  onBulkUpdateClick(BulkOperationType.LABEL, false, "");
                }}
              />
            </div>
          )}

                <div>
              
                  {
                    <button
                      onClick={bulkTagEdit}
                      disabled={isUpdating || showLabelInput || !isSameCat}
                      className={`flex items-center gap-2 px-4 py-2 border-4 border-gray-100 text-md rounded-md 
                        ${
                          queryState.bulkSelection?.isTagBulk
                            ? "border-orange-600 text-orange-600"
                            : "border-gray-400 text-gray-600"
                        } 
                        rounded hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <PiTag className="w-4 h-4" />
                      Deduction
                      {showTagPicker ? (
                        <ChevronUp className="w-4 h-4 orange-600 " />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  }
                </div>

                {showTagPicker && (
                  <div className="flex flex-col items-start gap-2">
                        <div className="flex gap-2">
                                  {!isLoading && (
                                    <select
                                      value={tagValue}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setTagValue(value);
                                        const tag = availableTags.find(
                                          (item) => +item.id === +value
                                        );
                                        setTagText(tag?.name);
                                      }}
                                      className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                      <option hidden disabled selected>
                                        -- Choose Tag --
                                      </option>
                                      {availableTags.length &&
                                        availableTags.map((tag) => {
                                          return (
                                            <option key={tag.id} value={tag.id}>
                                              {tag.name}
                                            </option>
                                          );
                                        })}
                                    </select>
                                  )}
                        </div>
                      <div>
                        <button
                        onClick={bulkTagSubmit}
                        disabled={isUpdating || !tagValue}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-blue-700 
                        disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>

                    )}

                    {queryState?.bulkSelection?.isTagBulk && !showTagPicker && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <p>{tagText}</p>
                        <X
                          size={16}
                          className="text-gray-500 cursor-pointer"
                          onClick={() => {
                            onBulkUpdateClick(BulkOperationType.TAG, false, {
                              type: null,
                              tag: null,
                            });
                          }}
                        />
                      </div>
                    )}

                    <div>
                            <button
                                onClick={() =>
                                  handleOperationClick(
                                    BulkOperationType.FLAG,
                                    true,
                                    tripleSwitch(queryState.bulkSelection?.flagData)
                                  )
                                }
                                disabled={isUpdating || showLabelInput || showTagPicker}
                                className={`p-1 border rounded-md
                                  ${
                                    queryState.bulkSelection?.flagData === null
                                      ? "border-gray-300 text-gray-400"
                                      : queryState.bulkSelection?.flagData
                                      ? "bg-green-100 border-green-600 text-green-600"
                                      : "bg-red-100 border-red-600 text-red-600"
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <Flag size={20} />
                              </button>

                    </div>
              </div>

        </div>
        <div className="flex gap-2 items-center font-semibold text-sm"> 

          <div>
              Clear
          </div>
          <div className="flex items-start gap-2 mx-12">
            <div> 
               <button
                      onClick={() =>
                        handleOperationClick(
                          BulkOperationType.LOCK,
                          true,
                          tripleSwitch(queryState.bulkSelection?.lockData)
                        )
                      }
                      disabled={isUpdating || showLabelInput || showTagPicker}
                      className="disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {queryState.bulkSelection?.lockData === null ? (
                        <LockOpen
                          size={30}
                          className="text-gray-400 border-gray-400 p-1 border rounded-md"
                        />
                      ) : queryState.bulkSelection?.lockData ? (
                        <Lock
                          size={30}
                          className="text-red-600 border-red-600 bg-red-50 p-1 border rounded-md"
                        />
                      ) : (
                        <LockOpen
                          size={30}
                          className="text-green-600 border-green-600 bg-green-50 p-1 border rounded-md"
                        />
                      )}
                </button>
              </div>
              <div>
                        <button
                          onClick={() =>
                            handleOperationClick(
                              BulkOperationType.HIDE,
                              true,
                              tripleSwitch(queryState.bulkSelection?.hideData)
                            )
                          }
                          disabled={isUpdating || showLabelInput || showTagPicker}
                          className="disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {queryState.bulkSelection?.hideData === null ? (
                            <Eye
                              size={30}
                              className="text-gray-400 border-gray-400 p-1 border rounded-md"
                            />
                          ) : queryState.bulkSelection?.hideData ? (
                            <EyeOff
                              size={30}
                              className="text-red-600 border-red-600 bg-red-50 p-1 border rounded-md"
                            />
                          ) : (
                            <Eye
                              size={30}
                              className="text-green-600 border-green-600 bg-green-50 p-1 border rounded-md"
                            />
                          )}
                        </button>       
                    </div>
            </div>
        </div>
        {selectedCount > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {selectedCount} transaction{selectedCount !== 1 ? "s" : ""}{" "}
              selected
            </span>
            {onClear && (
              <button
                onClick={onClear}
                className="text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {!showLabelInput && !showTagPicker && (
          <button
            onClick={onUpdate}
            disabled={isUpdating || !currentSelectedType || selectedCount <= 0}
            className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-blue-700 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Updating..." : "BULK UPDATE"}
          </button>
        )}
      </div>
    </Card>
  );
};

export default BulkUpdater;


{/* <div>
 {!showLabelInput && (
  // <button
  //   onClick={bulkLabelEdit}
  //   disabled={isUpdating || showTagPicker}
  //   className={`flex items-center gap-2 px-4 py-2 border-4 border-gray-100
  //     ${
  //       queryState.bulkSelection?.isLabelBulk
  //         ? "border-blue-500 text-blue-600"
  //         : "border-gray-400 text-gray-600"
  //     } 
  //     rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
  // >
  //   <Pencil className="w-4 h-4" />
  //   Edit Label
  // </button>
)}
</div> */}




