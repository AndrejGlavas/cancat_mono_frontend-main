import React, { useEffect, useState } from "react";
import { Pencil, X, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { transactionsApi } from '../services/transactionsApi';
import { Transaction, TransactionQueryParams } from "../utils/types";

const ITEMS_PER_PAGE = 10;

type SortField = 'type' | 'date' | 'label' | 'amount' | 'isW2';
type SortOrder = 'asc' | 'desc';

const IncomePage: React.FC = () => {  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const params: TransactionQueryParams = {};
        const response = await transactionsApi.getIncomeTransactions(params);
        setTransactions(response.transactions);
      } catch (err) {
        setError('Failed to fetch income transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchIncome();
  }, []);

  const handleToggle = async (id: number) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
   
    const newIncome = !transaction.income;
    const newDeposit = true;
  
    setTransactions(prevData => {
      const updatedData = prevData.map(t =>
        t.id === id ? { 
          ...t, 
          income: newIncome,
          deposit: newDeposit 
        } : t
      );
      
      return updatedData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
  
    try {
      await transactionsApi.updateCategory(
        id,
        {
          business: transaction.business,
          flag: false,
          lock: false,
          hidden: false,
          split: false,
          income: newIncome,
          deposit: newDeposit
        }
      );
    } catch (error) {
      console.error("Error updating income status:", error);
      setTransactions(prevData =>
        prevData.map(t =>
          t.id === id ? { 
            ...t, 
            income: transaction.income,
            deposit: transaction.deposit 
          } : t
        )
      );
    }
  };

  const handleW2Toggle = async (id: number) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
   
    const newW2Status = !transaction.incomew2;
    
    setTransactions(prevData => 
      prevData.map(t => t.id === id ? { ...t, incomew2: newW2Status } : t)
    );
  
    try {
      await transactionsApi.updateCategory(id, {
        ...transaction,
        incomew2: newW2Status
      });
    } catch (error) {
      console.error("Error updating W2 status:", error);
      setTransactions(prevData =>
        prevData.map(t => t.id === id ? { ...t, incomew2: transaction.incomew2 } : t)
      );
    }
  };

  const handleLabelEdit = (id: number, currentLabel: string) => {
    setEditingLabel(id);
    setNewLabel(currentLabel);
  };
  
  const handleLabelSave = async () => {
    if (editingLabel === null) return;
    
    try {
      await transactionsApi.updateLabel(editingLabel, newLabel);
      setTransactions(prevData =>
        prevData.map(transaction =>
          transaction.id === editingLabel
            ? { ...transaction, custom: newLabel }
            : transaction
        )
      );
      setEditingLabel(null);
      setNewLabel("");
    } catch (error) {
      console.error("Error updating label:", error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'type':
        return multiplier * (a.income === b.income ? 0 : a.income ? -1 : 1);
      case 'isW2':
        return multiplier * (a.incomew2 === b.incomew2 ? 0 : a.incomew2 ? -1 : 1);
      case 'date':
        return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'label':
        const labelA = a.custom || a.label;
        const labelB = b.custom || b.label;
        return multiplier * labelA.localeCompare(labelB);
      case 'amount':
        return multiplier * (a.amount - b.amount);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTotal = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0)
      .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getW2IncomeTotal = () => {
    return transactions
      .filter(t => t.income && t.incomew2)
      .reduce((sum, t) => sum + t.amount, 0)
      .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const get1099IncomeTotal = () => {
    return transactions
      .filter(t => t.income && !t.incomew2)
      .reduce((sum, t) => sum + t.amount, 0)
      .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getDepositTotal = () => {
    return transactions
      .filter(t => !t.income)
      .reduce((sum, t) => sum + t.amount, 0)
      .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getTypeIndicator = (transaction: Transaction) => {
    if (transaction.income) {
      return (

        <div 
        className="w-8 h-8 rounded-full border-4 border-sky-600 text-serif text-sky-600 flex items-center justify-center font-bold font-serif bg-white cursor-pointer hover:bg-sky-50"
        onClick={() => handleToggle(transaction.id)}
        >
        I
        </div>

      );
    }
    return (
      
      <div 
      className="w-8 h-8 rounded-full border-4 border-sky-300 text-sky-300 font-serif  flex items-center justify-center font-bold bg-white cursor-pointer hover:bg-sky-50"
      onClick={() => handleToggle(transaction.id)}
    >
      D
    </div>
    
    );
  };

  const SortableHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <th 
      className="p-3 text-left font-semibold cursor-pointer group hover:bg-gray-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown 
          size={16} 
          className={`transition-colors ${
            sortField === field ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        />
      </div>
    </th>
  );

  const renderPaginationControls = () => {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md mr-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md mr-2 ${
                currentPage === page
                  ? 'bg-sky-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} entries
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-pulse text-gray-500">Loading entries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="bg-white rounded-lg shadow p-6 w-2/3">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#4338CA]">Income & Deposits</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-sky-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total W2 Income</div>
            <div className="text-xl font-bold text-sky-700">
              ${getW2IncomeTotal()}
            </div>
          </div>
          <div className="bg-sky-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total 1099 Income</div>
            <div className="text-xl font-bold text-sky-700">
              ${get1099IncomeTotal()}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Deposits</div>
            <div className="text-xl font-bold text-sky-300">
              ${getDepositTotal()}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Combined Total</div>
            <div className="text-xl font-bold">
              ${getTotal()}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <SortableHeader field="type" label="Sort" />
                <SortableHeader field="isW2" label="W2?" />
                <SortableHeader field="date" label="Date" />
                <SortableHeader field="label" label="Label" />
                <SortableHeader field="amount" label="Amount" />
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id} 
                    className={`border-b border-gray-200 hover:bg-gray-50 ${
                      transaction.income ? 'bg-sky-50/30' : ''
                    }`}>
                
                <td className="p-3">{getTypeIndicator(transaction)}</td>
                <td className="p-3">
                    {transaction.income ? (
                      <span 
                        onClick={() => handleW2Toggle(transaction.id)}
                        className="cursor-pointer hover:text-sky-600 border rounded-md p-1 text-sm border-zinc-600"
                      >
                        {transaction.incomew2 ? 'W2' : '1099'}
                      </span>
                    ) : ''}
                  </td>
                    <td className="p-3">
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit", 
                        year: "2-digit",
                      })}
                    </td>
                  <td className="p-3">
                    {editingLabel === transaction.id ? (
                      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                          <div className="text-center">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-2xl text-[#4338CA] font-bold">Edit Label</h3>
                              <button
                                onClick={() => setEditingLabel(null)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={newLabel}
                              onChange={(e) => setNewLabel(e.target.value)}
                              className="w-full px-3 py-2 border rounded mb-4"
                              placeholder="Edit label"
                              autoFocus
                            />
                            <button
                              onClick={handleLabelSave}
                              className="w-full px-4 py-2 bg-[#4338CA] text-white rounded hover:bg-[#3730A3]"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className={transaction.custom ? "underline underline-offset-4" : ""}>
                          <span className="relative group">
                            {transaction.custom || transaction.label}
                            {transaction.custom && (
                              <span className="absolute w-max left-0 bottom-full mb-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 z-10">
                                {transaction.label}
                              </span>
                            )}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleLabelEdit(transaction.id, transaction.custom ?? transaction.label)}
                          className="ml-2 hover:text-blue-600 transition-colors"
                        >
                          <Pencil className="text-gray-400" size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className={`flex items-center ${transaction.income ? 'text-green-600' : ''}`}>
                      ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          {renderPaginationControls()}
        </div>
      </div>
    </div>
  );
};

export default IncomePage;