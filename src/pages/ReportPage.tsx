import { useState, useEffect } from 'react';
import { Transaction, TransactionTag, BusinessPercentageResponse } from '../utils/types';
import { transactionsApi } from '../services/transactionsApi';
import { businessPercentageApi } from '../services/businessPercentageApi';

type ReportType = 'income' | 'business' | 'personal' | 'split';
type TransactionType = 'Income' | 'Expenses' | 'W2 Income' | '1099 Income';

interface TagGroup {
  tag: TransactionTag | null;
  transactions: Transaction[];
  total: number;
}

const ReportPage = () => {
  const [rowData, setRowData] = useState<Transaction[]>([]);
  const [businessPercentage, setBusinessPercentage] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ReportType>('income');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [allTransResponse, incomeResponse, percentageResponse] = await Promise.all([
          transactionsApi.fetch({ page: 1, itemsPerPage: 3000 }),
          transactionsApi.getIncomeTransactions({}),
          businessPercentageApi.get() as Promise<BusinessPercentageResponse>
        ]);
        
        if (allTransResponse?.transactions) {
          const allTransactions = [...allTransResponse.transactions];
          if (incomeResponse?.transactions) {
            incomeResponse.transactions.forEach(incomeTrans => {
              if (!allTransactions.find(t => t.id === incomeTrans.id)) {
                allTransactions.push(incomeTrans);
              }
            });
          }
          setRowData(allTransactions);
        }
        
        if (percentageResponse?.status === 'success' && percentageResponse.data) {
          setBusinessPercentage(percentageResponse.data.businessPercentage);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const getReportDescription = () => {
    switch (activeFilter) {
      case 'income':
        return "Your income report shows all money received, separated into W2 (employer) and 1099 (freelance) income. Your accountant needs this to calculate your total taxable income and self-employment tax.";
      case 'business':
        return "Business expenses are costs directly related to running your business. They reduce your taxable income dollar-for-dollar, so it's important to track them carefully.";
      case 'personal':
        return "Personal deductions are tax-deductible expenses from your personal life, like charitable donations or mortgage interest. Only tagged expenses appear here -- your accountant does not need all of your personal expenses.";
      case 'split':
        return `Some expenses are partly business, partly personal. This report calculates the business portion at ${businessPercentage}%. Common examples include home office, phone, and internet expenses.`;
      default:
        return "";
    }
  };

  const getFilteredTransactions = () => {
    if (activeFilter === 'split') {
      return {
        income: [],
        expense: rowData.filter(t => t.deposit === false && t.split === true)
      };
    }
  
    return {
      income: activeFilter === 'income' ? 
        rowData.filter(t => t.deposit === true && t.income === true && t.hidden === false) : [],
      expense: rowData.filter(t => {
        if (activeFilter === 'business') {
          return t.deposit === false && t.business === true && t.split === false && t.hidden === false;
        }
        return t.deposit === false && t.business === false && t.split === false && t.hidden === false && t.tag !== null;
      })
    };
  };

  const groupExpensesByTag = (transactions: Transaction[]): TagGroup[] => {
    const groups: { [key: string]: TagGroup } = activeFilter === 'personal' 
      ? {} 
      : { 'untagged': { tag: null, transactions: [], total: 0 } };
  
    transactions.forEach(transaction => {
      const tagKey = transaction.tag ? String(transaction.tag.id) : 'untagged';
      if (!groups[tagKey] && (tagKey !== 'untagged' || activeFilter !== 'personal')) {
        groups[tagKey] = {
          tag: transaction.tag,
          transactions: [],
          total: 0
        };
      }
      if (groups[tagKey]) {
        groups[tagKey].transactions.push(transaction);
        groups[tagKey].total += transaction.amount;
      }
    });

    Object.values(groups).forEach(group => {
      group.transactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
  
    return Object.values(groups)
      .sort((a, b) => b.total - a.total);
  };

  const getSplitTotal = (transactions: Transaction[]): number => {
    return transactions.reduce((sum, t) => sum + (t.amount * businessPercentage / 100), 0);
  };

  const exportToCSV = (transactions: Transaction[], type: TransactionType, tagName?: string): void => {
    const now = new Date().toLocaleString();
    const reportName = activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
    const fileName = tagName 
      ? `${reportName}_${type}_${tagName}_${new Date().toISOString().split('T')[0]}.csv`
      : `${reportName}_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    
    const csvHeader = [
      `Report: ${reportName}`,
      `Type: ${type}`,
      tagName ? `Deduction: ${tagName}` : '',
      `Export Date: ${now}`,
      `Generated By: CanCat Finance - visit CanCat.io for more detail`,
      '',
      activeFilter === 'split' 
        ? 'Date,Label,Amount,Percentage,Deduction Amount,Flag'
        : 'Date,Label,Amount,Type,Flag',
      ''
    ].filter(Boolean).join('\n');
  
    const csvRows = transactions.map(t => {
      const date = new Date(t.date).toLocaleDateString();
      const label = t.custom ? `${t.custom} (${t.label})` : t.label;
      const cleanLabel = label.replace(/,/g, ' ');
      const amount = t.amount.toFixed(2);
      const flag = t.flag ? 'Flag' : '';
      
      if (activeFilter === 'split') {
        const deductionAmount = (t.amount * businessPercentage / 100).toFixed(2);
        return `${date},${cleanLabel},${amount},${businessPercentage}%,${deductionAmount},${flag}`;
      }
      
      const transactionType = t.income ? 'Income' : 'Expense';
      return `${date},${cleanLabel},${amount},${transactionType},${flag}`;
    });

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalDeduction = activeFilter === 'split' 
      ? (total * businessPercentage / 100)
      : total;
    
    const csvFooter = [
      '',
      `Subtotal,${total.toFixed(2)}`,
      activeFilter === 'split' ? `Total Deduction Amount,${totalDeduction.toFixed(2)}` : ''
    ].filter(Boolean).join('\n');
    
    const csvContent = `${csvHeader}\n${csvRows.join('\n')}\n${csvFooter}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderTransactionGroup = (transactions: Transaction[], title: TransactionType, showTags: boolean = false) => {
    if (!transactions.length) return null;
  
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  
    if (activeFilter === 'income') {
      const w2Transactions = transactions.filter(t => t.incomew2);
      const income1099Transactions = transactions.filter(t => !t.incomew2);
      
      return (
        <div className="mb-8">
          <div className="mb-6">
            <h4 className="font-medium text-gray-600 mb-2">W2 Income ({w2Transactions.length} transactions)</h4>
            {renderTransactionTable(w2Transactions)}
          </div>
          <div className="mb-6">
            <h4 className="font-medium text-gray-600 mb-2">1099 Income ({income1099Transactions.length} transactions)</h4>
            {renderTransactionTable(income1099Transactions)}
          </div>
        </div>
      );
    }
  
    if (!showTags) {
      return (
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700">
              {title} ({transactions.length} transactions)
            </h3>
          </div>
          {renderTransactionTable(sortedTransactions)}
        </div>
      );
    }
  
    const tagGroups = groupExpensesByTag(sortedTransactions);
    return (
      <div className="mb-8">
        {tagGroups.map((group) => (
          <div key={group.tag?.id || 'untagged'} className="mb-6">
            <div className="flex mb-2">
              <h4 className="font-medium text-gray-600">
                {group.tag?.name || 'Untagged'} 
              </h4>
              <span className="font-medium"> : 
                ${(activeFilter === 'split' ? group.total * businessPercentage / 100 : group.total)
                  .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {renderTransactionTable(group.transactions)} 
          </div>
        ))}
      </div>
    );
  };

  const renderTransactionTable = (transactions: Transaction[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left font-semibold">Date</th>
            <th className="p-3 text-left font-semibold">Label</th>
            <th className="p-3 text-left font-semibold">Amount</th>
            {activeFilter === 'split' && (
              <>
                <th className="p-3 text-left font-semibold">Percentage</th>
                <th className="p-3 text-left font-semibold">Deduction Amount</th>
              </>
            )}
            <th className="p-3 text-left font-semibold"> </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-3">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="p-3">
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
              </td>
              <td className="p-3">
                <span className={transaction.income ? 'text-green-600' : ''}>
                  ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </td>
              {activeFilter === 'split' && (
                <>
                  <td className="p-3">{businessPercentage}%</td>
                  <td className="p-3">
                    ${(transaction.amount * businessPercentage / 100)
                      .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </>
              )}
              <td className="p-3 text-sm text-gray-600">
                {transaction.flag ? 'FLAG' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const groupedTransactions = getFilteredTransactions();

  return (
    <div className="container mx-auto px-4 py-8 w-2/3">
      <h1 className="text-3xl font-bold text-center mb-2">Reports for your Accountant</h1>
      <p className="text-gray-600 text-center mb-6">Download these 4 reports and email them to your accountant.</p>
      
      <div className="flex justify-center mb-6">
        <nav className="flex space-x-2 bg-white rounded-lg p-1 shadow">
          {(['income', 'business', 'personal', 'split'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-md text-sm font-medium capitalize
                ${activeFilter === filter 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
            >
              {filter}
            </button>
          ))}
        </nav>
      </div>
  
      <div className="w-full p-4 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-indigo-700">
          {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Report
        </h2>
        {activeFilter === 'split' && (
          <p className="text-gray-600 mb-4 italic">
            {getReportDescription()}
          </p>
        )}

        {activeFilter === 'income' && (
          <p className="text-gray-600 mb-4 italic">
          {getReportDescription()}
           </p>
        )}

        {activeFilter === 'business' && (
            <p className="text-gray-600 mb-4 italic">
            {getReportDescription()}
             </p>
        )}

        {activeFilter === 'personal' && (
          <p className="text-gray-600 mb-4 italic">
          {getReportDescription()}
           </p>
        )}
        
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
  {activeFilter === 'income' && (
    <div className="bg-sky-50 p-4 rounded shadow col-span-2">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-gray-600 flex">
            <div className="w-8 h-8 mx-2 rounded-full border-4 border-sky-600 text-sky-600 flex items-center justify-center font-bold bg-white font-serif">I</div>
            Total Income 
          </div>
          <div className="text-2xl mx-10 font-bold">
            ${groupedTransactions.income
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button
          onClick={() => exportToCSV(groupedTransactions.income, 'Income')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Export Report
        </button>
      </div>
    </div>
  )}

  {activeFilter === 'business' && (
    <div className="bg-blue-100 p-4 rounded shadow col-span-2">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-gray-600 flex">
            <div className="w-8 h-8 mx-2 rounded-full border-4 border-blue-700 text-blue-700 flex items-center justify-center font-bold bg-white">B</div>
            Total Business Deductions
          </div>
          <div className="text-2xl mx-10 font-bold">
            ${groupedTransactions.expense
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button
          onClick={() => exportToCSV(groupedTransactions.expense, 'Expenses')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Export Report
        </button>
      </div>
    </div>
  )}

  {activeFilter === 'personal' && (
    <div className="bg-blue-100 p-4 rounded shadow col-span-2">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-gray-600 flex">
            <div className="w-8 h-8 mx-2 rounded-full border-4 border-blue-700 text-blue-700 flex items-center justify-center font-bold bg-white">P</div>
            Total Personal Deductions
          </div>
          <div className="text-2xl mx-10 font-bold">
            ${groupedTransactions.expense
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button
          onClick={() => exportToCSV(groupedTransactions.expense, 'Expenses')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Export Report
        </button>
      </div>
    </div>
  )}

{activeFilter === 'split' && (
    <div className="bg-sky-50 p-4 rounded shadow col-span-2">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-gray-600 flex">
            <div className="w-8 h-8 mx-2 rounded-full border-4 border-sky-600 text-sky-600 flex items-center justify-center font-bold bg-white font-serif">S</div>
            Total Split Deductions ({businessPercentage}%)
          </div>
          <div className="text-2xl mx-10 font-bold">
            ${getSplitTotal(groupedTransactions.expense)
              .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button
          onClick={() => exportToCSV(groupedTransactions.expense, 'Expenses')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Export Report
        </button>
      </div>
    </div>
  )}
</div>

{activeFilter === 'income' && (
  <>
    {renderTransactionGroup(groupedTransactions.income.filter(t => t.incomew2), 'W2 Income')}
    {renderTransactionGroup(groupedTransactions.income.filter(t => !t.incomew2), '1099 Income')}
  </>
)}

{activeFilter !== 'income' && renderTransactionGroup(groupedTransactions.expense, 'Expenses', true)}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;